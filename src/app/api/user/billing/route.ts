import { payosConfig } from "@/lib/payments/payos";
import { adminClient, fail, userIdFrom } from "@/lib/payments/server";

/**
 * Số lượt Pro còn lại và mười đơn gần nhất của người đang đăng nhập, kèm cờ
 * `payments` cho biết đã cấu hình payOS để mua thêm chưa.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const sb = adminClient();
  if (!sb) return fail(503, "config");
  const userId = await userIdFrom(req, sb);
  if (!userId) return fail(401, "auth");

  const [account, orders] = await Promise.all([
    sb.from("billing_accounts").select("credit_balance").eq("user_id", userId).maybeSingle(),
    sb
      .from("orders")
      .select("id, plan_id, amount_vnd, status, created_at, paid_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  if (account.error || orders.error) return fail(500, "db");
  return Response.json(
    {
      payments: payosConfig() !== null,
      balance: account.data?.credit_balance ?? 0,
      orders: orders.data.map((o) => ({
        id: o.id,
        planId: o.plan_id,
        amountVnd: o.amount_vnd,
        status: o.status,
        createdAt: o.created_at,
        paidAt: o.paid_at,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
