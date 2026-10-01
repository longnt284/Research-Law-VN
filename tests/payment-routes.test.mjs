// Kiểm thử các route thanh toán với Supabase và payOS giả lập bằng `fetch`.
// Ở đây chỉ kiểm cách route xác minh người gọi, lấy giá, kiểm chữ ký và gọi cơ
// sở dữ liệu. Tính nguyên tử và chống cộng hai lần nằm trong hàm SQL, kiểm ở
// `supabase/tests/payments_test.sql` trên cơ sở dữ liệu thật.
//
// Chạy: npm test
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { beforeEach, test } from "node:test";

const SB = "https://fake.supabase.co";
const KEY = "c".repeat(64);
process.env.NEXT_PUBLIC_SUPABASE_URL = SB;
process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
process.env.PAYOS_CLIENT_ID = "client";
process.env.PAYOS_API_KEY = "api";
process.env.PAYOS_CHECKSUM_KEY = KEY;
process.env.NEXT_PUBLIC_SITE_URL = "https://lex.test";

const { sign } = await import("../src/lib/payments/payos.ts");
const create = await import("../src/app/api/payments/create/route.ts");
const status = await import("../src/app/api/payments/status/[orderId]/route.ts");
const webhook = await import("../src/app/api/webhooks/payos/route.ts");

const USERS = { "token-a": "00000000-0000-4000-8000-00000000000a", "token-b": "00000000-0000-4000-8000-00000000000b" };
const A = USERS["token-a"];

/** Cơ sở dữ liệu giả: bảng `orders`, số dư, và các lần gọi ra ngoài. */
let db;
let payosFails;
beforeEach(() => {
  db = { orders: [], balances: {}, nextCode: 100001, payosCalls: [], rpcCalls: [], inserts: [] };
  payosFails = false;
});

// Hàm SQL `confirm_payos_payment`, bản thu gọn đủ cho kiểm thử route.
function confirm({ p_order_code, p_amount, p_currency, p_link_id }) {
  const o = db.orders.find((r) => r.provider_order_id === p_order_code);
  if (!o) return "unknown_order";
  if (o.status === "PAID") return "duplicate";
  if (p_amount !== o.amount_vnd) return "amount_mismatch";
  if (p_currency !== o.currency) return "currency_mismatch";
  if (p_link_id !== o.provider_link_id) return "link_mismatch";
  o.status = "PAID";
  db.balances[o.user_id] = (db.balances[o.user_id] ?? 0) + o.credits;
  return "paid";
}

function matches(row, params) {
  for (const [k, v] of params) {
    if (["select", "order", "limit"].includes(k)) continue;
    if (v.startsWith("eq.") && String(row[k]) !== v.slice(3)) return false;
    if (v === "not.is.null" && row[k] == null) return false;
    if (v.startsWith("gt.") && !(row[k] > v.slice(3))) return false;
  }
  return true;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function rows(req, list) {
  const one = (req.headers.get("accept") ?? "").includes("vnd.pgrst.object");
  if (!one) return json(list);
  return list.length === 1 ? json(list[0]) : json({ code: "PGRST116", message: "no rows" }, 406);
}

globalThis.fetch = async (input, init) => {
  const req = new Request(input, init);
  const url = new URL(req.url);
  if (url.origin === "https://api-merchant.payos.vn") {
    const body = await req.json();
    db.payosCalls.push({ body, headers: Object.fromEntries(req.headers) });
    if (payosFails) return json({ code: "231", desc: "Đơn thanh toán đã tồn tại", data: null });
    return json({
      code: "00",
      desc: "success",
      data: {
        paymentLinkId: `link-${body.orderCode}`,
        checkoutUrl: `https://pay.payos.vn/web/link-${body.orderCode}`,
        qrCode: "00020101021238570010A0000007270127",
      },
    });
  }
  assert.equal(url.origin, SB);
  if (url.pathname === "/auth/v1/user") {
    const id = USERS[(req.headers.get("authorization") ?? "").replace("Bearer ", "")];
    return id ? json({ id, aud: "authenticated" }) : json({ msg: "invalid JWT" }, 401);
  }
  if (url.pathname === "/rest/v1/rpc/confirm_payos_payment") {
    const args = await req.json();
    db.rpcCalls.push(args);
    return json(confirm(args));
  }
  if (url.pathname === "/rest/v1/orders") {
    const params = [...url.searchParams];
    if (req.method === "GET") return rows(req, db.orders.filter((r) => matches(r, params)));
    if (req.method === "POST") {
      const body = await req.json();
      db.inserts.push(body);
      const row = {
        id: randomUUID(),
        status: "PENDING",
        currency: "VND",
        provider_order_id: db.nextCode++,
        provider_link_id: null,
        qr_code: null,
        checkout_url: null,
        created_at: new Date().toISOString(),
        ...body,
      };
      db.orders.push(row);
      return rows(req, [row]);
    }
    if (req.method === "PATCH") {
      const patch = await req.json();
      const hit = db.orders.filter((r) => matches(r, params));
      for (const r of hit) Object.assign(r, patch);
      return rows(req, hit);
    }
  }
  throw new Error(`unexpected request ${req.method} ${req.url}`);
};

function post(path, body, token) {
  return new Request(`https://lex.test${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}

function get(path, token) {
  return new Request(`https://lex.test${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

async function buy(planId, extra = {}, token = "token-a") {
  const res = await create.POST(post("/api/payments/create", { planId, provider: "payos", lang: "vi", ...extra }, token));
  return { res, body: await res.json() };
}

function statusOf(orderId, token) {
  return status.GET(get(`/api/payments/status/${orderId}`, token), { params: Promise.resolve({ orderId }) });
}

function paidWebhook(order, overrides = {}) {
  const data = {
    orderCode: order.provider_order_id,
    amount: order.amount_vnd,
    description: `LNL${order.provider_order_id}`,
    accountNumber: "12345678",
    reference: "FT2610010001",
    transactionDateTime: "2026-10-01 10:00:00",
    currency: "VND",
    paymentLinkId: order.provider_link_id,
    code: "00",
    desc: "success",
    counterAccountBankId: "",
    counterAccountBankName: "",
    counterAccountName: "",
    counterAccountNumber: "",
    virtualAccountName: "",
    virtualAccountNumber: "",
    ...overrides,
  };
  return { code: "00", desc: "success", success: true, data, signature: sign(data, KEY) };
}

// ── Tạo đơn ──────────────────────────────────────────────────────────────────

for (const [planId, price, credits] of [
  ["starter", 10_000, 20],
  ["plus", 50_000, 120],
  ["pro", 100_000, 300],
]) {
  test(`create: ${planId} charges ${price} VND taken from the server catalogue`, async () => {
    const { res, body } = await buy(planId);
    assert.equal(res.status, 200);
    assert.equal(body.status, "PENDING");
    assert.equal(body.amountVnd, price);
    assert.match(body.description, /^LNL\d{6}$/);
    assert.ok(body.qrCode);
    assert.equal(db.inserts[0].amount_vnd, price);
    assert.equal(db.inserts[0].credits, credits);
    assert.equal(db.inserts[0].user_id, A);
    const call = db.payosCalls[0];
    assert.equal(call.body.amount, price);
    assert.equal(call.headers["x-client-id"], "client");
    const { amount, cancelUrl, description, orderCode, returnUrl } = call.body;
    assert.equal(call.body.signature, sign({ amount, cancelUrl, description, orderCode, returnUrl }, KEY));
    assert.ok(returnUrl.startsWith(`https://lex.test/vi/tai-khoan?order=${body.orderId}`));
  });
}

test("create: price and credits sent by the client are ignored", async () => {
  const { body } = await buy("pro", { amount: 1, amountVnd: 1, priceVnd: 1, credits: 99_999 });
  assert.equal(body.amountVnd, 100_000);
  assert.equal(db.payosCalls[0].body.amount, 100_000);
  assert.equal(db.inserts[0].amount_vnd, 100_000);
  assert.equal(db.inserts[0].credits, 300);
});

test("create: invalid plan or provider is rejected without creating an order", async () => {
  for (const extra of [{ planId: "free" }, { planId: "Pro" }, { planId: "pro", provider: "momo" }]) {
    const res = await create.POST(post("/api/payments/create", { provider: "payos", ...extra }, "token-a"));
    assert.equal(res.status, 400);
  }
  assert.equal(db.orders.length, 0);
  assert.equal(db.payosCalls.length, 0);
});

test("create: unauthenticated or invalid session is rejected", async () => {
  assert.equal((await buy("plus", {}, null)).res.status, 401);
  assert.equal((await buy("plus", {}, "forged-token")).res.status, 401);
  assert.equal(db.orders.length, 0);
});

test("create: pressing pay twice reuses the pending order", async () => {
  const first = await buy("plus");
  const second = await buy("plus");
  assert.equal(second.body.orderId, first.body.orderId);
  assert.equal(db.orders.length, 1);
  assert.equal(db.payosCalls.length, 1);
});

test("create: payOS failure marks the order FAILED and returns 502", async () => {
  payosFails = true;
  const { res } = await buy("plus");
  assert.equal(res.status, 502);
  assert.equal(db.orders[0].status, "FAILED");
});

// ── Webhook ──────────────────────────────────────────────────────────────────

test("webhook: valid payment marks the order PAID and grants credits", async () => {
  await buy("plus");
  const order = db.orders[0];
  const res = await webhook.POST(post("/api/webhooks/payos", paidWebhook(order)));
  assert.equal(res.status, 200);
  assert.deepEqual(db.rpcCalls[0], {
    p_order_code: order.provider_order_id,
    p_amount: 50_000,
    p_currency: "VND",
    p_link_id: order.provider_link_id,
    p_reference: "FT2610010001",
  });
  assert.equal(order.status, "PAID");
  assert.equal(db.balances[A], 120);
});

test("webhook: duplicate deliveries grant credits once", async () => {
  await buy("plus");
  const order = db.orders[0];
  for (let i = 0; i < 3; i++) {
    const res = await webhook.POST(post("/api/webhooks/payos", paidWebhook(order)));
    assert.equal(res.status, 200);
  }
  assert.equal(db.balances[A], 120);
});

test("webhook: invalid signature is rejected before touching the database", async () => {
  await buy("plus");
  const body = paidWebhook(db.orders[0]);
  body.signature = "0".repeat(64);
  const res = await webhook.POST(post("/api/webhooks/payos", body));
  assert.equal(res.status, 401);
  assert.equal(db.rpcCalls.length, 0);
  assert.equal(db.orders[0].status, "PENDING");
});

test("webhook: changing the amount after signing breaks the signature", async () => {
  await buy("pro");
  const body = paidWebhook(db.orders[0], { amount: 10_000 });
  body.data.amount = 100_000;
  assert.equal((await webhook.POST(post("/api/webhooks/payos", body))).status, 401);
  assert.equal(db.orders[0].status, "PENDING");
});

test("webhook: signed payment with the wrong amount does not unlock", async () => {
  await buy("pro");
  const res = await webhook.POST(post("/api/webhooks/payos", paidWebhook(db.orders[0], { amount: 10_000 })));
  assert.equal(res.status, 200);
  assert.equal(db.orders[0].status, "PENDING");
  assert.equal(db.balances[A], undefined);
});

test("webhook: unknown order (payOS test delivery) is acknowledged but grants nothing", async () => {
  const res = await webhook.POST(
    post("/api/webhooks/payos", paidWebhook({ provider_order_id: 123, amount_vnd: 3000, provider_link_id: "x" })),
  );
  assert.equal(res.status, 200);
  assert.deepEqual(db.balances, {});
});

test("webhook: non-success notice does not reach the database", async () => {
  await buy("plus");
  const body = paidWebhook(db.orders[0]);
  body.code = "01";
  body.success = false;
  assert.equal((await webhook.POST(post("/api/webhooks/payos", body))).status, 200);
  assert.equal(db.rpcCalls.length, 0);
});

// ── Trạng thái đơn ───────────────────────────────────────────────────────────

test("status: owner sees the order turn PAID only after the webhook", async () => {
  const { body } = await buy("starter");
  assert.equal((await (await statusOf(body.orderId, "token-a")).json()).status, "PENDING");
  await webhook.POST(post("/api/webhooks/payos", paidWebhook(db.orders[0])));
  const after = await (await statusOf(body.orderId, "token-a")).json();
  assert.equal(after.status, "PAID");
  assert.equal(after.qrCode, null);
});

test("status: another user cannot read the order", async () => {
  const { body } = await buy("starter");
  const res = await statusOf(body.orderId, "token-b");
  assert.equal(res.status, 404);
  assert.equal((await statusOf(body.orderId, null)).status, 401);
});

test("status: an expired pending order becomes EXPIRED", async () => {
  const { body } = await buy("starter");
  db.orders[0].expires_at = new Date(Date.now() - 1000).toISOString();
  const res = await (await statusOf(body.orderId, "token-a")).json();
  assert.equal(res.status, "EXPIRED");
  assert.equal(db.orders[0].status, "EXPIRED");
});
