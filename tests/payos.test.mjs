import assert from "node:assert/strict";
import test from "node:test";

import { readWebhook, sign, signatureData, verifySignature } from "../src/lib/payments/payos.ts";
import { formatVnd, planById, PLANS, turnCost } from "../src/lib/plans.ts";

// Dữ liệu mẫu, Checksum Key và chữ ký trong mã mẫu JavaScript của payOS:
// https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/
const DOC_KEY = "1a54716c8f0efb2744fb28b6e38b25da7f67a925d98bc1c18bd8faaecadd7675";
const DOC_SIGNATURE = "412e915d2871504ed31be63c8f62a149a4410d34c4c42affc9006ef9917eaa03";
const DOC_DATA = {
  orderCode: 123,
  amount: 3000,
  description: "VQRIO123",
  accountNumber: "12345678",
  reference: "TF230204212323",
  transactionDateTime: "2023-02-04 18:25:00",
  currency: "VND",
  paymentLinkId: "124c33293c43417ab7879e14c8d9eb18",
  code: "00",
  desc: "Thành công",
  counterAccountBankId: "",
  counterAccountBankName: "",
  counterAccountName: "",
  counterAccountNumber: "",
  virtualAccountName: "",
  virtualAccountNumber: "",
};

test("signature matches the payOS documentation sample", () => {
  assert.equal(sign(DOC_DATA, DOC_KEY), DOC_SIGNATURE);
  assert.equal(verifySignature(DOC_DATA, DOC_SIGNATURE, DOC_KEY), true);
  assert.equal(verifySignature(DOC_DATA, DOC_SIGNATURE.toUpperCase(), DOC_KEY), true);
});

test("signature rejects tampered data, a wrong key and malformed signatures", () => {
  assert.equal(verifySignature({ ...DOC_DATA, amount: 300000 }, DOC_SIGNATURE, DOC_KEY), false);
  assert.equal(verifySignature(DOC_DATA, DOC_SIGNATURE, "0".repeat(64)), false);
  assert.equal(verifySignature(DOC_DATA, "", DOC_KEY), false);
  assert.equal(verifySignature(DOC_DATA, "not-hex", DOC_KEY), false);
  assert.equal(verifySignature(DOC_DATA, DOC_SIGNATURE.slice(0, 62), DOC_KEY), false);
});

test("payment-request signature string follows the documented field order", () => {
  assert.equal(
    signatureData({ returnUrl: "https://x/r", orderCode: 100001, amount: 50000, description: "LNL100001", cancelUrl: "https://x/c" }),
    "amount=50000&cancelUrl=https://x/c&description=LNL100001&orderCode=100001&returnUrl=https://x/r",
  );
});

test("signature string turns null into empty and arrays into sorted JSON", () => {
  assert.equal(
    signatureData({ b: null, a: [{ y: 1, x: 2 }], c: undefined, d: "null" }),
    'a=[{"x":2,"y":1}]&b=&d=',
  );
});

function webhook(data, key = DOC_KEY, extra = {}) {
  return { code: "00", desc: "success", success: true, data, signature: sign(data, key), ...extra };
}

test("readWebhook accepts a correctly signed successful payment", () => {
  const r = readWebhook(webhook(DOC_DATA), DOC_KEY);
  assert.deepEqual(r, {
    ok: true,
    paid: {
      orderCode: 123,
      amount: 3000,
      currency: "VND",
      paymentLinkId: "124c33293c43417ab7879e14c8d9eb18",
      reference: "TF230204212323",
    },
  });
});

test("readWebhook rejects a bad signature before reading the payment", () => {
  const body = webhook(DOC_DATA);
  body.data = { ...body.data, amount: 1 };
  assert.deepEqual(readWebhook(body, DOC_KEY), { ok: false, reason: "signature" });
  assert.deepEqual(readWebhook(webhook(DOC_DATA, "f".repeat(64)), DOC_KEY), { ok: false, reason: "signature" });
});

test("readWebhook rejects malformed bodies", () => {
  assert.deepEqual(readWebhook(null, DOC_KEY), { ok: false, reason: "body" });
  assert.deepEqual(readWebhook({ data: DOC_DATA }, DOC_KEY), { ok: false, reason: "body" });
  assert.deepEqual(readWebhook({ data: [], signature: "00" }, DOC_KEY), { ok: false, reason: "body" });
  assert.deepEqual(readWebhook(webhook({ ...DOC_DATA, orderCode: "123" }), DOC_KEY), { ok: false, reason: "body" });
});

test("readWebhook does not treat a non-success notice as a payment", () => {
  assert.deepEqual(readWebhook(webhook(DOC_DATA, DOC_KEY, { code: "01", success: false }), DOC_KEY), {
    ok: true,
    paid: null,
  });
  assert.deepEqual(readWebhook(webhook({ ...DOC_DATA, code: "01" }), DOC_KEY), { ok: true, paid: null });
});

test("plan catalogue has the agreed prices", () => {
  assert.deepEqual(
    PLANS.map((p) => [p.id, p.priceVnd]),
    [
      ["starter", 10_000],
      ["plus", 50_000],
      ["pro", 100_000],
    ],
  );
  assert.ok(PLANS.every((p) => Number.isInteger(p.credits) && p.credits > 0));
  assert.equal(planById("plus")?.priceVnd, 50_000);
  assert.equal(planById("PLUS"), undefined);
  assert.equal(planById({ id: "pro" }), undefined);
});

test("turn cost and VND format", () => {
  assert.equal(turnCost(false, false), 0);
  assert.equal(turnCost(true, false), 1);
  assert.equal(turnCost(false, true), 1);
  assert.equal(turnCost(true, true), 2);
  assert.equal(formatVnd(10_000), "10.000đ");
  assert.equal(formatVnd(100_000), "100.000đ");
});
