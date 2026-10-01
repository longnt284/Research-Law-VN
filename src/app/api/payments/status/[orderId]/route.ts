import { adminClient, fail, ORDER_COLUMNS, orderView, userIdFrom } from "@/lib/payments/server";

/**
 * Trạng thái một đơn, cho trang tài khoản hỏi lại vài giây một lần.
 *
 * Chỉ đọc, không xác nhận gì: đơn chuyển PAID duy nhất qua webhook payOS đã
 * kiểm chữ ký. Người dùng chỉ thấy đơn của chính mình; đơn của người khác trả
 * 404 như đơn không tồn tại.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }): Promise<Response> {
  const sb = adminClient();
  if (!sb) return fail(503, "config");
  const { orderId } = await params;
  const userId = await userIdFrom(req, sb);
  if (!userId) return fail(401, "auth");
  if (!UUID.test(orderId)) return fail(404, "order");

  const { data, error } = await sb
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return fail(500, "db");
  if (!data) return fail(404, "order");

  // Hết hạn link mà chưa có webhook: ghi EXPIRED. Nếu tiền vẫn đến sau đó,
  // webhook vẫn xác nhận được đơn (xem `confirm_payos_payment`).
  if (data.status === "PENDING" && Date.parse(data.expires_at) < Date.now()) {
    await sb
      .from("orders")
      .update({ status: "EXPIRED", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("status", "PENDING");
    data.status = "EXPIRED";
  }
  return Response.json(orderView(data), { headers: { "Cache-Control": "no-store" } });
}
