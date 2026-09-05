import type { NextConfig } from "next";

/*
  Chính sách nguồn nội dung.

  Trang này không nạp mã, kiểu dáng, ảnh hay phông chữ từ bên thứ ba: phông do
  `next/font` tải về và phục vụ ngay tại chỗ, thư viện three nằm trong gói mã
  của trang, và không có đoạn mã theo dõi nào. Vì vậy khoá `default-src 'self'`
  không làm hỏng thứ gì mà lại chặn hẳn một nhánh tấn công: mã lạ chèn được vào
  trang vẫn không gửi được dữ liệu đi đâu.

  `script-src` buộc phải nhận `'unsafe-inline'`. Toàn bộ trang được dựng sẵn
  thành HTML tĩnh, nên không có yêu cầu nào để sinh `nonce` cho từng lần tải, mà
  Next thì luôn nhúng đoạn mã khởi động và dữ liệu trang thẳng vào HTML. Đây là
  chỗ yếu có thật của chính sách này, ghi ra để người đọc sau không tưởng nhầm
  là đã chặn được mã nội tuyến.

  Chỉ áp ở bản dựng production. Ở chế độ phát triển, Next dùng `eval` cho việc
  nạp lại theo thay đổi, và `upgrade-insecure-requests` thì không hợp với
  localhost chạy trên http.
*/
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const isProd = process.env.NODE_ENV === "production";

const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Trang không dùng máy ảnh, micrô, vị trí hay cảm biến nào. Nói rõ điều đó thì
  // một khung nhúng lạ cũng không xin được các quyền ấy dưới tên trang này.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const prodHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  // Hai năm, kèm tên miền con. Chỉ có tác dụng khi trang đã chạy trên HTTPS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [{ source: "/", destination: "/vi", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: isProd ? [...baseHeaders, ...prodHeaders] : baseHeaders,
      },
    ];
  },
};

export default nextConfig;
