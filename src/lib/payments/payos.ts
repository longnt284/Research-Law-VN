import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * payOS: tạo link thanh toán chuyển khoản (VietQR) và kiểm chữ ký webhook.
 *
 * Theo tài liệu chính thức:
 * - API: https://payos.vn/docs/api/ (tạo link: `POST /v2/payment-requests`).
 * - Chữ ký: https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/
 *   HMAC-SHA256 bằng Checksum Key của kênh thanh toán, trên chuỗi
 *   `key1=value1&key2=value2...` với các khóa xếp theo bảng chữ cái.
 *
 * Tệp này không import gì của trang (không dùng alias `@/`), để kiểm thử chạy
 * thẳng bằng `node --test`.
 */

const API = "https://api-merchant.payos.vn";
const TIMEOUT_MS = 15_000;

export interface PayosConfig {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

/** Đủ ba khóa của kênh thanh toán thì bật thanh toán, thiếu thì tắt. */
export function payosConfig(): PayosConfig | null {
  const clientId = process.env.PAYOS_CLIENT_ID?.trim() ?? "";
  const apiKey = process.env.PAYOS_API_KEY?.trim() ?? "";
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY?.trim() ?? "";
  return clientId && apiKey && checksumKey ? { clientId, apiKey, checksumKey } : null;
}

function sortByKey(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));
}

/**
 * Chuỗi được ký, chép đúng hàm `convertObjToQueryStr` trong mã mẫu JavaScript
 * của payOS: bỏ khóa `undefined`; `null`, `"null"`, `"undefined"` thành chuỗi
 * rỗng; mảng thành JSON với khóa của từng phần tử đã xếp.
 */
export function signatureData(data: Record<string, unknown>): string {
  return Object.keys(data)
    .sort()
    .filter((key) => data[key] !== undefined)
    .map((key) => {
      let value = data[key];
      if (Array.isArray(value)) {
        value = JSON.stringify(value.map((v) => (v && typeof v === "object" ? sortByKey(v) : v)));
      }
      if (value === null || value === "null" || value === "undefined") value = "";
      return `${key}=${value}`;
    })
    .join("&");
}

export function sign(data: Record<string, unknown>, checksumKey: string): string {
  return createHmac("sha256", checksumKey).update(signatureData(data)).digest("hex");
}

export function verifySignature(data: Record<string, unknown>, signature: string, checksumKey: string): boolean {
  const expected = Buffer.from(sign(data, checksumKey), "hex");
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export interface PaymentLinkInput {
  orderCode: number;
  amount: number;
  /** Nội dung chuyển khoản; tối đa 9 ký tự với tài khoản ngân hàng không liên kết qua payOS. */
  description: string;
  returnUrl: string;
  cancelUrl: string;
  /** Unix timestamp (giây). */
  expiredAt: number;
}

export interface PaymentLink {
  paymentLinkId: string;
  checkoutUrl: string;
  /** Chuỗi VietQR; trang tự vẽ thành mã QR. */
  qrCode: string;
}

/** Tạo link thanh toán. Ném lỗi (không chứa khóa) khi payOS từ chối hoặc không trả lời. */
export async function createPaymentLink(config: PayosConfig, input: PaymentLinkInput): Promise<PaymentLink> {
  const { amount, cancelUrl, description, orderCode, returnUrl } = input;
  const res = await fetch(`${API}/v2/payment-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.clientId,
      "x-api-key": config.apiKey,
    },
    body: JSON.stringify({
      ...input,
      signature: sign({ amount, cancelUrl, description, orderCode, returnUrl }, config.checksumKey),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  let json: { code?: unknown; desc?: unknown; data?: Record<string, unknown> | null } = {};
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  const d = json.data;
  if (
    json.code !== "00" ||
    !d ||
    typeof d.paymentLinkId !== "string" ||
    typeof d.checkoutUrl !== "string" ||
    typeof d.qrCode !== "string"
  ) {
    throw new Error(`payOS từ chối tạo link: HTTP ${res.status}, code ${String(json.code)}, ${String(json.desc)}`);
  }
  return { paymentLinkId: d.paymentLinkId, checkoutUrl: d.checkoutUrl, qrCode: d.qrCode };
}

export interface PaidTransaction {
  orderCode: number;
  amount: number;
  currency: string;
  paymentLinkId: string;
  reference: string;
}

export type WebhookCheck =
  | { ok: true; paid: PaidTransaction | null }
  | { ok: false; reason: "body" | "signature" };

/**
 * Đọc và kiểm một webhook payOS. Chữ ký sai là `signature`; dữ liệu sai dạng
 * là `body`. Webhook hợp lệ nhưng không báo thanh toán thành công trả về
 * `paid: null`.
 */
export function readWebhook(body: unknown, checksumKey: string): WebhookCheck {
  if (!body || typeof body !== "object") return { ok: false, reason: "body" };
  const { code, success, data, signature } = body as Record<string, unknown>;
  if (!data || typeof data !== "object" || Array.isArray(data) || typeof signature !== "string") {
    return { ok: false, reason: "body" };
  }
  const d = data as Record<string, unknown>;
  if (!verifySignature(d, signature, checksumKey)) return { ok: false, reason: "signature" };
  if (code !== "00" || success !== true || d.code !== "00") return { ok: true, paid: null };
  const { orderCode, amount, currency, paymentLinkId, reference } = d;
  if (
    !Number.isSafeInteger(orderCode) ||
    !Number.isSafeInteger(amount) ||
    typeof currency !== "string" ||
    typeof paymentLinkId !== "string" ||
    typeof reference !== "string"
  ) {
    return { ok: false, reason: "body" };
  }
  return {
    ok: true,
    paid: { orderCode: orderCode as number, amount: amount as number, currency, paymentLinkId, reference },
  };
}
