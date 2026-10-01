import type { Lang } from "@/data/types";
import type { OrderStatus } from "@/lib/payments/server";

/** Chữ của phần mua lượt Pro trên trang tài khoản (`BillingPanel`). */

export interface BillingCopy {
  title: string;
  intro: string;
  balance: (n: number) => string;
  loading: string;
  plans: string;
  credits: (n: number) => string;
  method: string;
  methodBank: string;
  pay: (amount: string) => string;
  creating: string;
  payTitle: (amount: string) => string;
  scan: string;
  qrLabel: string;
  amount: string;
  note: string;
  waiting: string;
  autoUpdate: string;
  openCheckout: string;
  paidTitle: string;
  paidText: string;
  continueChat: string;
  expired: string;
  failed: string;
  timeout: string;
  recheck: string;
  newOrder: string;
  buyMore: string;
  history: string;
  status: Record<OrderStatus, string>;
  errors: { auth: string; plan: string; provider: string; config: string; generic: string };
}

const vi: BillingCopy = {
  title: "Lượt hỏi Pro",
  intro:
    "Khi đã dùng hết lượt Gemini 3.1 Pro và suy luận mở rộng miễn phí trong ngày, mỗi câu hỏi dùng Gemini 3.1 Pro hoặc suy luận mở rộng trừ 1 lượt Pro đã mua (dùng cả hai trừ 2 lượt). Câu hỏi thường không trừ lượt.",
  balance: (n) => `Bạn còn ${n} lượt Pro.`,
  loading: "Đang tải…",
  plans: "Chọn gói",
  credits: (n) => `${n} lượt Pro`,
  method: "Phương thức",
  methodBank: "Chuyển khoản ngân hàng bằng mã VietQR (payOS)",
  pay: (amount) => `Thanh toán ${amount}`,
  creating: "Đang tạo mã thanh toán…",
  payTitle: (amount) => `Thanh toán ${amount}`,
  scan: "Quét mã bằng ứng dụng ngân hàng hoặc ví hỗ trợ VietQR.",
  qrLabel: "Mã VietQR để chuyển khoản",
  amount: "Số tiền",
  note: "Nội dung chuyển khoản",
  waiting: "Đang chờ thanh toán…",
  autoUpdate: "Trang tự cập nhật khi nhận được tiền, không cần tải lại.",
  openCheckout: "Mở trang thanh toán payOS",
  paidTitle: "Thanh toán thành công",
  paidText: "Quyền sử dụng đã được cập nhật.",
  continueChat: "Tiếp tục sử dụng Lex AI",
  expired: "Mã thanh toán đã hết hạn. Nếu bạn đã chuyển tiền, bấm Kiểm tra lại; nếu chưa, tạo mã mới.",
  failed: "Đơn này không tạo được mã thanh toán. Hãy tạo mã mới.",
  timeout: "Chưa nhận được xác nhận thanh toán. Nếu bạn đã chuyển tiền, bấm Kiểm tra lại sau ít phút.",
  recheck: "Kiểm tra lại",
  newOrder: "Tạo mã mới",
  buyMore: "Mua thêm lượt",
  history: "Đơn gần đây",
  status: {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Lỗi",
    CANCELLED: "Đã hủy",
    EXPIRED: "Hết hạn",
  },
  errors: {
    auth: "Phiên đăng nhập đã hết. Đăng nhập lại rồi thử lại.",
    plan: "Gói không hợp lệ.",
    provider: "payOS chưa tạo được mã thanh toán. Thử lại sau ít phút.",
    config: "Thanh toán chưa được bật trên trang này.",
    generic: "Không kết nối được máy chủ. Thử lại sau ít phút.",
  },
};

const en: BillingCopy = {
  title: "Pro questions",
  intro:
    "Once today's free Gemini 3.1 Pro and extended-thinking quota is used up, each question that uses Gemini 3.1 Pro or extended thinking costs 1 purchased Pro credit (2 when it uses both). Standard questions cost nothing.",
  balance: (n) => `You have ${n} Pro credit${n === 1 ? "" : "s"} left.`,
  loading: "Loading…",
  plans: "Choose a plan",
  credits: (n) => `${n} Pro credits`,
  method: "Payment method",
  methodBank: "Bank transfer by VietQR code (payOS)",
  pay: (amount) => `Pay ${amount}`,
  creating: "Creating the payment code…",
  payTitle: (amount) => `Pay ${amount}`,
  scan: "Scan the code with a banking or wallet app that supports VietQR.",
  qrLabel: "VietQR code for the transfer",
  amount: "Amount",
  note: "Transfer note",
  waiting: "Waiting for payment…",
  autoUpdate: "This page updates by itself when the money arrives; no need to reload.",
  openCheckout: "Open the payOS payment page",
  paidTitle: "Payment received",
  paidText: "Your access has been updated.",
  continueChat: "Continue with Lex AI",
  expired: "The payment code has expired. If you already transferred, press Check again; if not, create a new code.",
  failed: "No payment code could be created for this order. Create a new code.",
  timeout: "No payment confirmation yet. If you already transferred, press Check again in a few minutes.",
  recheck: "Check again",
  newOrder: "Create a new code",
  buyMore: "Buy more credits",
  history: "Recent orders",
  status: {
    PENDING: "Awaiting payment",
    PAID: "Paid",
    FAILED: "Failed",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
  },
  errors: {
    auth: "Your session has expired. Sign in again and retry.",
    plan: "Invalid plan.",
    provider: "payOS could not create a payment code. Try again in a few minutes.",
    config: "Payments are not enabled on this site.",
    generic: "Could not reach the server. Try again in a few minutes.",
  },
};

export const billingCopy: Record<Lang, BillingCopy> = { vi, en };

export function getBillingCopy(lang: Lang): BillingCopy {
  return billingCopy[lang];
}
