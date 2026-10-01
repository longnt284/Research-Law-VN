/**
 * Giới hạn lượt hỏi của trợ lý, giữ trong bộ nhớ của tiến trình.
 *
 * Trên serverless mỗi phiên bản giữ một bảng riêng, nên đây là giới hạn tương
 * đối: đủ để một người không dùng hết hạn mức miễn phí của cả trang, không phải
 * hàng rào chống tấn công. Khóa bị xóa khỏi bảng sau tối đa 24 giờ.
 *
 * Mỗi người được tính theo thiết bị: trình duyệt tự sinh một mã ngẫu nhiên và
 * gửi trong header `X-Chat-Client`. Mạng di động ở Việt Nam cho nhiều thuê bao
 * dùng chung một địa chỉ IP, nên giới hạn chỉ theo IP sẽ chặn oan người không
 * hỏi câu nào. Mã thiết bị thì ai cũng tự đổi được, nên mỗi địa chỉ IP còn có
 * một trần rộng hơn, chặn việc đổi mã liên tục để hỏi vô hạn.
 *
 * Ở Free tier của Gemini, trần thật là hạn mức theo ngày của project trên
 * Google: nới các số dưới đây chỉ chia hạn mức đó cho công bằng hơn, không làm
 * trang trả lời được nhiều câu hơn.
 */

export const LIMITS = {
  /** Mỗi thiết bị. */
  perMinute: 10,
  perDay: 100,
  /**
   * Mỗi địa chỉ IP, cộng mọi thiết bị dùng chung địa chỉ đó: đủ cho một lớp học
   * hay một văn phòng dùng chung mạng cùng hỏi một lúc.
   */
  ipPerMinute: 60,
  ipPerDay: 500,
  /** Gemini 3.1 Pro và suy luận mở rộng: mỗi thiết bị, và trần theo IP. */
  premiumPerDay: 20,
  premiumIpPerDay: 60,
  /**
   * Model OpenRouter chọn tay, mỗi thiết bị. Model miễn phí của OpenRouter dùng
   * chung hạn mức ngày của cả tài khoản (50 lượt, hoặc 1.000 lượt khi tài khoản
   * đã từng nạp 10 USD), và hạn mức đó còn là chốt dự phòng khi Gemini hết lượt.
   */
  freePerDay: 10,
} as const;

const DAY_MS = 86_400_000;
const MAX_KEYS = 10_000;

/** Các lượt trong 24 giờ qua của từng khóa. */
export class Window {
  private hits = new Map<string, number[]>();

  private recent(key: string, now: number): number[] {
    const list = (this.hits.get(key) ?? []).filter((t) => now - t < DAY_MS);
    this.hits.set(key, list);
    return list;
  }

  over(key: string, now: number, perDay: number, perMinute = Infinity): boolean {
    const list = this.recent(key, now);
    return list.length >= perDay || list.filter((t) => now - t < 60_000).length >= perMinute;
  }

  add(key: string, now: number) {
    if (this.hits.size > MAX_KEYS) {
      for (const [k, v] of this.hits) if (now - v[v.length - 1] >= DAY_MS) this.hits.delete(k);
      if (this.hits.size > MAX_KEYS) this.hits.clear();
    }
    this.recent(key, now).push(now);
  }
}

export interface Check {
  window: Window;
  key: string;
  perDay: number;
  perMinute?: number;
}

/**
 * Nhận một lượt khi mọi giới hạn còn chỗ, và chỉ khi đó mới ghi lượt vào mọi
 * bảng: lượt bị chặn không bị tính.
 */
export function admit(now: number, checks: Check[]): boolean {
  if (checks.some((c) => c.window.over(c.key, now, c.perDay, c.perMinute))) return false;
  for (const c of checks) c.window.add(c.key, now);
  return true;
}

const CLIENT_ID = /^[A-Za-z0-9_-]{16,64}$/;

/**
 * Khóa thiết bị của yêu cầu. Thiếu mã hay mã sai dạng (trình duyệt chặn lưu
 * trữ, công cụ gọi thẳng API) thì tính theo địa chỉ IP như trước.
 */
export function deviceKey(req: Request, ip: string): string {
  const id = req.headers.get("x-chat-client") ?? "";
  return CLIENT_ID.test(id) ? `d:${id}` : `ip:${ip}`;
}
