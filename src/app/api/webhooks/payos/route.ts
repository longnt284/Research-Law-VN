import { payosConfig, readWebhook } from "@/lib/payments/payos";
import { adminClient, fail, logPayment } from "@/lib/payments/server";

/**
 * Webhook payOS: nguồn xác nhận thanh toán duy nhất.
 *
 * Thứ tự kiểm: chữ ký HMAC bằng Checksum Key (sai thì 401, không chạm cơ sở
 * dữ liệu); mã thành công; rồi hàm `confirm_payos_payment` đối chiếu đơn, nhà
 * cung cấp, số tiền, tiền tệ, mã link và cộng lượt, tất cả trong một giao dịch
 * cơ sở dữ liệu. Webhook gửi lại cho đơn đã PAID trả về thành công nhưng không
 * cộng thêm.
 *
 * Mọi webhook có chữ ký hợp lệ đều được trả 200, kể cả khi không cộng lượt
 * (đơn lạ, sai số tiền): payOS gửi một webhook mẫu khi đăng ký URL và chỉ chấp
 * nhận URL trả 2xx; gửi lại một webhook sai số tiền cũng không làm nó đúng.
 * Lỗi cơ sở dữ liệu trả 500 để payOS gửi lại.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const check = readWebhook(body, payos.checksumKey);
  if (!check.ok) {
    logPayment(check.reason === "signature" ? "signature_invalid" : "webhook_invalid", { provider: "payos" });
    return fail(check.reason === "signature" ? 401 : 400, check.reason);
  }
  if (!check.paid) {
    logPayment("webhook_not_success", { provider: "payos" });
    return Response.json({ success: true });
  }

  const p = check.paid;
  logPayment("webhook_received", { orderCode: p.orderCode, provider: "payos" });
  const { data: outcome, error } = await sb.rpc("confirm_payos_payment", {
    p_order_code: p.orderCode,
    p_amount: p.amount,
    p_currency: p.currency,
    p_link_id: p.paymentLinkId,
    p_reference: p.reference,
  });
  if (error) {
    logPayment("db_error", { orderCode: p.orderCode, provider: "payos", step: "confirm", reason: error.message });
    return fail(500, "db");
  }
  if (outcome === "paid") {
    logPayment("payment_confirmed", { orderCode: p.orderCode, provider: "payos", status: "PAID" });
    logPayment("entitlement_granted", { orderCode: p.orderCode, provider: "payos" });
  } else {
    // duplicate, unknown_order, amount_mismatch, currency_mismatch, link_mismatch, no_user
    logPayment(outcome === "duplicate" ? "duplicate_webhook" : "payment_rejected", {
      orderCode: p.orderCode,
      provider: "payos",
      reason: String(outcome),
      amount: p.amount,
    });
  }
  return Response.json({ success: true });
}
