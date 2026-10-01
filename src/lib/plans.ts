/**
 * Bảng giá lượt Pro của trợ lý hỏi đáp: nơi duy nhất ghi giá và số lượt.
 *
 * Máy chủ đọc giá từ đây khi tạo đơn và chụp giá, số lượt vào đơn
 * (`orders.amount_vnd`, `orders.credits`), nên trình duyệt không quyết định
 * được số tiền, và đổi bảng giá không làm sai các đơn đã tạo. Trang tài khoản
 * đọc cùng bảng này để hiển thị.
 *
 * Đổi số lượt mỗi gói: sửa `credits` ở dưới. Giá 10.000đ / 50.000đ / 100.000đ
 * là giá đã chốt. Thêm gói mới: thêm một dòng, mã gói chỉ gồm chữ thường, số
 * và gạch nối (khớp ràng buộc `orders.plan_id`).
 *
 * Một "lượt Pro" là một câu hỏi vượt hạn mức miễn phí mỗi ngày của Gemini 3.1
 * Pro hoặc suy luận mở rộng (xem `src/app/api/chat/route.ts`). Lượt đã mua
 * không có hạn dùng.
 */

export type PlanId = "starter" | "plus" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  priceVnd: number;
  credits: number;
}

export const PLANS: readonly Plan[] = [
  { id: "starter", name: "Starter", priceVnd: 10_000, credits: 20 },
  { id: "plus", name: "Plus", priceVnd: 50_000, credits: 120 },
  { id: "pro", name: "Pro", priceVnd: 100_000, credits: 300 },
];

export function planById(id: unknown): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/**
 * Số lượt một câu hỏi tiêu khi đã hết hạn mức miễn phí: 1 lượt cho Gemini 3.1
 * Pro, 1 lượt cho suy luận mở rộng, cộng dồn khi dùng cả hai.
 */
export function turnCost(pro: boolean, thinking: boolean): number {
  return (pro ? 1 : 0) + (thinking ? 1 : 0);
}

/** `10000` → `10.000đ`. */
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}
