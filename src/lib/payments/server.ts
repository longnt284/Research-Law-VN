import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Phần máy chủ của thanh toán và lượt Pro: kết nối Supabase bằng khóa bí mật,
 * xác minh người gọi API, trừ và hoàn lượt, ghi nhật ký.
 *
 * Chỉ route API import tệp này. `SUPABASE_SECRET_KEY` không có tiền tố
 * `NEXT_PUBLIC_`, nên Next.js không bao giờ đưa nó vào mã chạy trên trình
 * duyệt; ở trình duyệt biến này luôn rỗng.
 */

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SECRET = process.env.SUPABASE_SECRET_KEY ?? "";

let admin: SupabaseClient | null = null;

/** Kết nối quyền máy chủ (bỏ qua RLS); null khi chưa cấu hình. */
export function adminClient(): SupabaseClient | null {
  if (!SB_URL.startsWith("https://") || !SECRET) return null;
  admin ??= createClient(SB_URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

/**
 * Người đang gọi API: trình duyệt gửi access token của phiên Supabase trong
 * `Authorization: Bearer …`, máy chủ hỏi lại Supabase Auth xem token có thật
 * và còn hạn không. Không tin bất kỳ mã người dùng nào trong thân yêu cầu.
 */
export async function userIdFrom(req: Request, sb: SupabaseClient): Promise<string | null> {
  const m = /^Bearer (\S+)$/.exec(req.headers.get("authorization") ?? "");
  if (!m) return null;
  const { data, error } = await sb.auth.getUser(m[1]);
  return error || !data.user ? null : data.user.id;
}

/**
 * Nhật ký có cấu trúc (một dòng JSON) cho Vercel Logs. Chỉ ghi mã đơn, nhà
 * cung cấp, trạng thái và lý do; không ghi khóa, token hay header.
 */
export function logPayment(event: string, fields: Record<string, string | number | null | undefined> = {}): void {
  console.info(JSON.stringify({ scope: "payments", event, ...fields }));
}

export interface PaidTurn {
  userId: string;
  cost: number;
  /** Số lượt còn lại sau khi trừ. */
  balance: number;
}

/**
 * Trừ `cost` lượt Pro của người gọi. Trả về null khi không đăng nhập, chưa cấu
 * hình, hoặc không đủ lượt; khi đó câu hỏi chạy ở chế độ thường.
 */
export async function spendCredits(req: Request, cost: number): Promise<PaidTurn | null> {
  if (cost <= 0 || !req.headers.has("authorization")) return null;
  const sb = adminClient();
  if (!sb) return null;
  const userId = await userIdFrom(req, sb);
  if (!userId) return null;
  const { data, error } = await sb.rpc("spend_credits", { p_user_id: userId, p_cost: cost });
  if (error) {
    console.error(`payments: không trừ được lượt Pro: ${error.message}`);
    return null;
  }
  return typeof data === "number" ? { userId, cost, balance: data } : null;
}

/** Hoàn lượt đã trừ khi câu hỏi không được trả lời. */
export async function refundCredits(turn: PaidTurn): Promise<void> {
  const sb = adminClient();
  if (!sb) return;
  const { error } = await sb.rpc("refund_credits", { p_user_id: turn.userId, p_cost: turn.cost });
  if (error) console.error(`payments: không hoàn được lượt Pro: ${error.message}`);
}

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";

/** Phần của đơn mà trình duyệt được thấy. */
export interface OrderView {
  orderId: string;
  status: OrderStatus;
  planId: string;
  amountVnd: number;
  /** Nội dung chuyển khoản. */
  description: string;
  /** Chuỗi VietQR, chỉ có khi đơn còn chờ thanh toán. */
  qrCode: string | null;
  checkoutUrl: string | null;
  expiresAt: string;
}

export const ORDER_COLUMNS = "id, status, plan_id, amount_vnd, provider_order_id, qr_code, checkout_url, expires_at";

interface OrderRow {
  id: string;
  status: OrderStatus;
  plan_id: string;
  amount_vnd: number;
  provider_order_id: number;
  qr_code: string | null;
  checkout_url: string | null;
  expires_at: string;
}

/**
 * Nội dung chuyển khoản gửi payOS: "LNL" và mã đơn, 9 ký tự cho tới đơn thứ
 * 999.999 (giới hạn 9 ký tự áp cho tài khoản không liên kết qua payOS).
 */
export function transferNote(orderCode: number): string {
  return `LNL${orderCode}`;
}

export function orderView(row: OrderRow): OrderView {
  const pending = row.status === "PENDING";
  return {
    orderId: row.id,
    status: row.status,
    planId: row.plan_id,
    amountVnd: row.amount_vnd,
    description: transferNote(row.provider_order_id),
    qrCode: pending ? row.qr_code : null,
    checkoutUrl: pending ? row.checkout_url : null,
    expiresAt: row.expires_at,
  };
}

export function fail(status: number, error: string): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}
