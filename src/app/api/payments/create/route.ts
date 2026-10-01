import type { Lang } from "@/data/types";
import { isLang } from "@/i18n/dictionary";
import { createPaymentLink, payosConfig } from "@/lib/payments/payos";
import {
  adminClient,
  fail,
  logPayment,
  ORDER_COLUMNS,
  orderView,
  transferNote,
  userIdFrom,
} from "@/lib/payments/server";
import { planById } from "@/lib/plans";
import { SITE_URL } from "@/lib/site";

/**
 * Tạo đơn mua lượt Pro và link chuyển khoản payOS.
 *
 * Thân yêu cầu chỉ có `{ planId, provider, lang }`. Số tiền và số lượt lấy từ
 * bảng giá phía máy chủ (`src/lib/plans.ts`); mọi trường khác trình duyệt gửi
 * lên, kể cả `amount`, đều bị bỏ qua.
 *
 * Mã lỗi: 400 gói hay phương thức không hợp lệ, 401 chưa đăng nhập, 502 payOS
 * từ chối hoặc không trả lời, 500 lỗi cơ sở dữ liệu, 503 chưa cấu hình.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Thời hạn của link thanh toán. */
const ORDER_TTL_MS = 15 * 60_000;
/** Bấm lại cùng gói khi đơn cũ còn ít nhất chừng này thời gian thì dùng lại đơn cũ. */
const REUSE_MIN_LEFT_MS = 2 * 60_000;

export async function POST(req: Request): Promise<Response> {
  const sb = adminClient();
  const payos = payosConfig();
  if (!sb || !payos) return fail(503, "config");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "body");
  }
  const { planId, provider, lang } = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const plan = planById(planId);
  if (!plan || provider !== "payos") return fail(400, "plan");
  const userId = await userIdFrom(req, sb);
  if (!userId) return fail(401, "auth");
  const l: Lang = typeof lang === "string" && isLang(lang) ? lang : "vi";

  // Bấm hai lần, hay tải lại trang rồi bấm lại, không sinh thêm đơn.
  const reuse = await sb
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("user_id", userId)
    .eq("plan_id", plan.id)
    .eq("status", "PENDING")
    .not("qr_code", "is", null)
    .gt("expires_at", new Date(Date.now() + REUSE_MIN_LEFT_MS).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (reuse.error) {
    logPayment("db_error", { provider: "payos", step: "reuse", reason: reuse.error.message });
    return fail(500, "db");
  }
  if (reuse.data) {
    logPayment("order_reused", { orderId: reuse.data.id, provider: "payos", status: "PENDING" });
    return Response.json(orderView(reuse.data), { headers: { "Cache-Control": "no-store" } });
  }

  const expires = new Date(Date.now() + ORDER_TTL_MS);
  const inserted = await sb
    .from("orders")
    .insert({
      user_id: userId,
      plan_id: plan.id,
      provider: "payos",
      amount_vnd: plan.priceVnd,
      credits: plan.credits,
      expires_at: expires.toISOString(),
    })
    .select("id, provider_order_id")
    .single();
  if (inserted.error) {
    logPayment("db_error", { provider: "payos", step: "insert", reason: inserted.error.message });
    return fail(500, "db");
  }
  const { id, provider_order_id: orderCode } = inserted.data as { id: string; provider_order_id: number };

  // Trang quay về chỉ để người dùng thấy trạng thái; nó không xác nhận gì.
  const back = `${SITE_URL}/${l}/tai-khoan?order=${id}#nang-cap`;
  let link;
  try {
    link = await createPaymentLink(payos, {
      orderCode,
      amount: plan.priceVnd,
      description: transferNote(orderCode),
      returnUrl: back,
      cancelUrl: back,
      expiredAt: Math.floor(expires.getTime() / 1000),
    });
  } catch (e) {
    await sb.from("orders").update({ status: "FAILED", updated_at: new Date().toISOString() }).eq("id", id);
    logPayment("create_failed", {
      orderId: id,
      provider: "payos",
      status: "FAILED",
      reason: e instanceof Error ? e.message : "không rõ",
    });
    return fail(502, "provider");
  }

  // Không lưu được mã link thì không đưa QR cho người dùng: webhook của một
  // link không có trong đơn sẽ bị từ chối, người chuyển tiền sẽ không nhận lượt.
  const saved = await sb
    .from("orders")
    .update({
      provider_link_id: link.paymentLinkId,
      checkout_url: link.checkoutUrl,
      qr_code: link.qrCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(ORDER_COLUMNS)
    .single();
  if (saved.error) {
    logPayment("db_error", { orderId: id, provider: "payos", step: "save_link", reason: saved.error.message });
    return fail(500, "db");
  }
  logPayment("payment_created", { orderId: id, orderCode, provider: "payos", status: "PENDING", plan: plan.id });
  return Response.json(orderView(saved.data), { headers: { "Cache-Control": "no-store" } });
}
