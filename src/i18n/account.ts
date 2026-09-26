import type { Lang } from "@/data/types";

/** Lời của trang tài khoản và nút tài khoản trên thanh điều hướng. */
export interface AccountCopy {
  nav: string;
  navSignedIn: string;
  title: string;
  lede: string;
  disabled: string;
  tabs: { signIn: string; signUp: string; reset: string };
  email: string;
  password: string;
  passwordNew: string;
  passwordHint: string;
  signIn: string;
  signUp: string;
  sendReset: string;
  working: string;
  signedUpConfirm: string;
  resetSent: string;
  recovery: string;
  savePassword: string;
  passwordSaved: string;
  signedInAs: string;
  since: (d: string) => string;
  synced: string;
  follows: (n: number) => string;
  matters: (n: number) => string;
  openWatch: string;
  changePassword: string;
  signOut: string;
  signOutNote: string;
  deleteTitle: string;
  deleteText: string;
  deleteConfirm: string;
  deleteButton: string;
  deleted: string;
  errors: {
    invalid: string;
    exists: string;
    weak: string;
    notConfirmed: string;
    rate: string;
    generic: string;
  };
  privacy: string;
}

const vi: AccountCopy = {
  nav: "Đăng nhập",
  navSignedIn: "Tài khoản",
  title: "Tài khoản",
  lede: "Tạo tài khoản để văn bản đang theo dõi và bộ hồ sơ đi theo bạn trên mọi máy. Không có tài khoản, các tiện ích này vẫn dùng được nhưng chỉ lưu trong trình duyệt hiện tại.",
  disabled: "Tài khoản chưa được bật trên bản triển khai này. Mọi tiện ích vẫn dùng được và lưu trong trình duyệt.",
  tabs: { signIn: "Đăng nhập", signUp: "Tạo tài khoản", reset: "Quên mật khẩu" },
  email: "Email",
  password: "Mật khẩu",
  passwordNew: "Mật khẩu mới",
  passwordHint: "Ít nhất 8 ký tự.",
  signIn: "Đăng nhập",
  signUp: "Tạo tài khoản",
  sendReset: "Gửi liên kết đặt lại mật khẩu",
  working: "Đang xử lý…",
  signedUpConfirm: "Đã tạo tài khoản. Hãy mở email vừa nhận và bấm liên kết xác nhận, rồi đăng nhập.",
  resetSent: "Nếu email này có tài khoản, liên kết đặt lại mật khẩu đã được gửi tới hộp thư.",
  recovery: "Đặt mật khẩu mới cho tài khoản.",
  savePassword: "Lưu mật khẩu",
  passwordSaved: "Đã lưu mật khẩu mới.",
  signedInAs: "Đang đăng nhập",
  since: (d) => `Tạo ngày ${d}`,
  synced: "Văn bản theo dõi và bộ hồ sơ được đồng bộ với tài khoản.",
  follows: (n) => `${n} văn bản đang theo dõi`,
  matters: (n) => `${n} bộ hồ sơ`,
  openWatch: "Mở trang theo dõi",
  changePassword: "Đổi mật khẩu",
  signOut: "Đăng xuất",
  signOutNote: "Đăng xuất sẽ xóa danh sách theo dõi và bộ hồ sơ khỏi trình duyệt này; dữ liệu vẫn nằm trong tài khoản.",
  deleteTitle: "Xóa tài khoản",
  deleteText: "Xóa vĩnh viễn tài khoản, danh sách theo dõi và mọi bộ hồ sơ trên máy chủ. Không khôi phục được.",
  deleteConfirm: "Gõ email của bạn để xác nhận",
  deleteButton: "Xóa vĩnh viễn tài khoản",
  deleted: "Đã xóa tài khoản.",
  errors: {
    invalid: "Email hoặc mật khẩu không đúng.",
    exists: "Email này đã có tài khoản. Hãy đăng nhập.",
    weak: "Mật khẩu quá ngắn hoặc quá dễ đoán.",
    notConfirmed: "Email chưa được xác nhận. Hãy mở liên kết trong email xác nhận.",
    rate: "Thử quá nhiều lần. Đợi vài phút rồi thử lại.",
    generic: "Không thực hiện được. Thử lại sau.",
  },
  privacy: "Tài khoản chỉ lưu email, mật khẩu đã băm, danh sách văn bản theo dõi và bộ hồ sơ, trên Supabase. Không có dữ liệu nào khác được thu thập.",
};

const en: AccountCopy = {
  nav: "Sign in",
  navSignedIn: "Account",
  title: "Account",
  lede: "Create an account so your watchlist and matters follow you across devices. Without one, these tools still work but are stored in this browser only.",
  disabled: "Accounts are not enabled on this deployment. Every tool still works and is stored in your browser.",
  tabs: { signIn: "Sign in", signUp: "Create account", reset: "Forgot password" },
  email: "Email",
  password: "Password",
  passwordNew: "New password",
  passwordHint: "At least 8 characters.",
  signIn: "Sign in",
  signUp: "Create account",
  sendReset: "Send a reset link",
  working: "Working…",
  signedUpConfirm: "Account created. Open the email you just received, follow the confirmation link, then sign in.",
  resetSent: "If this email has an account, a reset link is on its way.",
  recovery: "Set a new password for your account.",
  savePassword: "Save password",
  passwordSaved: "New password saved.",
  signedInAs: "Signed in as",
  since: (d) => `Created ${d}`,
  synced: "Your watchlist and matters are synced with your account.",
  follows: (n) => `${n} followed ${n === 1 ? "instrument" : "instruments"}`,
  matters: (n) => `${n} ${n === 1 ? "matter" : "matters"}`,
  openWatch: "Open the watchlist",
  changePassword: "Change password",
  signOut: "Sign out",
  signOutNote: "Signing out removes your watchlist and matters from this browser; they stay in your account.",
  deleteTitle: "Delete account",
  deleteText: "Permanently delete the account, its watchlist and every matter on the server. This cannot be undone.",
  deleteConfirm: "Type your email to confirm",
  deleteButton: "Permanently delete account",
  deleted: "Account deleted.",
  errors: {
    invalid: "Wrong email or password.",
    exists: "This email already has an account. Sign in instead.",
    weak: "The password is too short or too easy to guess.",
    notConfirmed: "The email is not confirmed yet. Open the link in the confirmation email.",
    rate: "Too many attempts. Wait a few minutes and try again.",
    generic: "That did not work. Try again later.",
  },
  privacy: "The account stores only your email, a hashed password, your watchlist and your matters, on Supabase. Nothing else is collected.",
};

export const accountCopy: Record<Lang, AccountCopy> = { vi, en };

export function getAccountCopy(lang: Lang): AccountCopy {
  return accountCopy[lang];
}
