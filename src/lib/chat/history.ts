"use client";

import type { ChatCopy } from "@/i18n/chat";
import type { SkillId } from "@/lib/chat/skills";
import { readRaw, useStored, writeRaw } from "@/lib/client-store";

/**
 * Lịch sử trò chuyện của trợ lý: tối đa `MAX_CONVERSATIONS` cuộc gần nhất, chỉ
 * nằm trong `localStorage` của trình duyệt. Máy chủ không lưu gì; mỗi lượt hỏi
 * vẫn gửi lại phần trước của cuộc trò chuyện như cũ.
 *
 * Không đồng bộ theo tài khoản: câu hỏi pháp lý có thể nhạy cảm, nên nó không
 * rời máy người dùng ngoài lượt gửi tới mô hình. Người dùng xóa được từng cuộc
 * hoặc toàn bộ.
 *
 * Khung chat nổi và trang `/hoi-dap` là hai bản của cùng khung chat, nên cuộc
 * đang mở được ghi ở `sessionStorage`: chuyển trang rồi mở khung chat nổi vẫn
 * thấy đúng cuộc đang dở.
 */

export type Cut = keyof ChatCopy["cut"];
export type Limit = keyof ChatCopy["limited"];

export interface Msg {
  role: "user" | "assistant";
  content: string;
  skills?: SkillId[];
  /** Mã model đã trả lời. */
  model?: string;
  /** Model do trang tự chọn theo độ khó. */
  auto?: boolean;
  thinking?: boolean;
  /** Các hạn mức đã hết trong ngày, khiến câu hỏi chạy bằng model khác. */
  limited?: Limit[];
  /** Số lượt Pro đã mua còn lại, khi câu này vừa dùng lượt mua. */
  credits?: number;
  /** Câu trả lời chưa trọn và lý do. */
  cut?: Cut;
  /** Bản tóm tắt suy luận của mô hình; không gửi lại lên máy chủ, không lưu. */
  reasoning?: string;
  /** Thông báo lỗi hiện ở chỗ câu trả lời; không gửi lại lên máy chủ. */
  error?: boolean;
}

export interface Conversation {
  id: string;
  /** Câu hỏi đầu tiên, cắt ngắn. */
  title: string;
  /** Lần đổi cuối, mili giây. */
  updated: number;
  msgs: Msg[];
}

export const MAX_CONVERSATIONS = 5;
/** Số tin giữ lại của mỗi cuộc; máy chủ cũng chỉ nhận 16 tin gần nhất mỗi lượt. */
const MAX_MSGS = 40;
const TITLE_CHARS = 60;

const HISTORY = "ll:chat-history";
const ACTIVE = "ll:chat-active";
const PENDING = "ll:chat-pending";
const DEVICE = "ll:chat-device";

const EMPTY: Conversation[] = [];

const str = (v: unknown): v is string => typeof v === "string";
const strs = (v: unknown): v is string[] => Array.isArray(v) && v.every(str);

/** Đọc tin từ bộ nhớ, ai cũng sửa tay được: chỉ giữ trường đúng kiểu. */
function cleanMsg(v: unknown): Msg | null {
  if (!v || typeof v !== "object") return null;
  const m = v as Record<string, unknown>;
  if ((m.role !== "user" && m.role !== "assistant") || !str(m.content)) return null;
  const out: Msg = { role: m.role, content: m.content };
  if (strs(m.skills)) out.skills = m.skills as SkillId[];
  if (str(m.model)) out.model = m.model;
  if (m.auto === true) out.auto = true;
  if (m.thinking === true) out.thinking = true;
  if (strs(m.limited)) out.limited = m.limited as Limit[];
  if (typeof m.credits === "number") out.credits = m.credits;
  if (str(m.cut)) out.cut = m.cut as Cut;
  if (m.error === true) out.error = true;
  return out;
}

function parseHistory(raw: string | null): Conversation[] {
  if (!raw) return EMPTY;
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return EMPTY;
    const out: Conversation[] = [];
    for (const c of v) {
      if (!c || typeof c !== "object" || !str(c.id) || !str(c.title) || typeof c.updated !== "number") continue;
      const msgs = Array.isArray(c.msgs) ? c.msgs.map(cleanMsg).filter((m: Msg | null): m is Msg => !!m) : [];
      if (msgs.length > 0) out.push({ id: c.id, title: c.title, updated: c.updated, msgs });
    }
    return out.sort((a, b) => b.updated - a.updated).slice(0, MAX_CONVERSATIONS);
  } catch {
    return EMPTY;
  }
}

/** Các cuộc trò chuyện, mới nhất trước. */
export function useConversations(): Conversation[] {
  return useStored("local", HISTORY, parseHistory, EMPTY);
}

export function readConversation(id: string): Conversation | undefined {
  return parseHistory(readRaw("local", HISTORY)).find((c) => c.id === id);
}

/** Tên của cuộc trò chuyện: câu hỏi đầu tiên, cắt ở ranh giới từ. */
export function titleOf(msgs: Msg[]): string {
  const first = (msgs.find((m) => m.role === "user")?.content ?? "").replace(/\s+/g, " ").trim();
  if (first.length <= TITLE_CHARS) return first;
  const cut = first.slice(0, TITLE_CHARS);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), TITLE_CHARS / 2))}…`;
}

/**
 * Ghi cuộc trò chuyện `id`, bỏ phần suy luận và tin cũ quá `MAX_MSGS`. Trả về
 * `true` khi phải bỏ cuộc cũ nhất để giữ tối đa `MAX_CONVERSATIONS` cuộc.
 */
export function saveConversation(id: string, msgs: Msg[]): boolean {
  const kept = msgs
    .slice(-MAX_MSGS)
    .filter((m) => m.content.trim())
    .map((m) => ({ ...m, reasoning: undefined }));
  if (kept.length === 0) return false;
  const list = parseHistory(readRaw("local", HISTORY)).filter((c) => c.id !== id);
  const next = [{ id, title: titleOf(kept), updated: Date.now(), msgs: kept }, ...list];
  writeRaw("local", HISTORY, JSON.stringify(next.slice(0, MAX_CONVERSATIONS)));
  return next.length > MAX_CONVERSATIONS;
}

export function deleteConversation(id: string) {
  const list = parseHistory(readRaw("local", HISTORY)).filter((c) => c.id !== id);
  writeRaw("local", HISTORY, list.length ? JSON.stringify(list) : null);
  if (activeConversation() === id) setActiveConversation(null);
}

export function clearConversations() {
  writeRaw("local", HISTORY, null);
  setActiveConversation(null);
}

function randomId(bytes: number): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function newConversationId(): string {
  return randomId(8);
}

export function activeConversation(): string | null {
  return readRaw("session", ACTIVE);
}

export function setActiveConversation(id: string | null) {
  writeRaw("session", ACTIVE, id);
}

/**
 * Câu hỏi gõ ở ô hỏi trang chủ, chờ trang `/hoi-dap` gửi đi. Giữ trong
 * `sessionStorage` thay vì trên địa chỉ trang, để câu hỏi không nằm trong lịch
 * sử duyệt web hay nhật ký máy chủ.
 */
export function setPendingQuestion(q: string) {
  writeRaw("session", PENDING, q);
}

export function takePendingQuestion(): string | null {
  const q = readRaw("session", PENDING);
  if (q !== null) writeRaw("session", PENDING, null);
  return q?.trim() || null;
}

/**
 * Mã thiết bị ngẫu nhiên, gửi kèm mỗi câu hỏi để máy chủ tính giới hạn lượt
 * theo thiết bị thay vì theo địa chỉ IP (`src/lib/chat/limits.ts`). Không gắn
 * với danh tính nào. Trình duyệt chặn lưu trữ thì trả về rỗng; máy chủ khi đó
 * tính theo IP.
 */
export function chatDeviceId(): string {
  const have = readRaw("local", DEVICE);
  if (have && /^[a-f0-9]{32}$/.test(have)) return have;
  const id = randomId(16);
  writeRaw("local", DEVICE, id);
  return readRaw("local", DEVICE) === id ? id : "";
}
