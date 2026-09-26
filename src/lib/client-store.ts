"use client";

import { useSyncExternalStore } from "react";

/**
 * Trạng thái riêng của người đọc, giữ ngay trong trình duyệt.
 *
 * Trang không có tài khoản và không có máy chủ nhận dữ liệu, nên những gì gắn
 * với một người — văn bản vừa xem, văn bản đang theo dõi, câu tìm gần đây, ngày
 * tra cứu đang đặt — nằm trong `localStorage` hoặc `sessionStorage` của chính
 * trình duyệt đó. Không có gì được gửi đi.
 *
 * Mọi lần đọc ghi đều bọc trong try/catch: trình duyệt ở chế độ riêng tư hoặc
 * đã chặn lưu trữ thì các tiện ích này lặng lẽ trống, còn trang vẫn chạy đủ.
 *
 * Khi có tài khoản, chỉ cần thay phần đọc ghi ở đây bằng lời gọi máy chủ; các
 * thành phần dùng hook bên dưới không phải đổi.
 */

type Area = "local" | "session";

const EVENT = "ll:store";

function storage(area: Area): Storage | null {
  try {
    return area === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function readRaw(area: Area, key: string): string | null {
  try {
    return storage(area)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeRaw(area: Area, key: string, value: string | null) {
  try {
    const s = storage(area);
    if (!s) return;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    // Hết chỗ hoặc bị chặn: bỏ qua, tiện ích chỉ không nhớ được lần này.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  // Thẻ khác của cùng trang đổi dữ liệu thì thẻ này cũng theo.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/*
  `useSyncExternalStore` đòi ảnh chụp ổn định: cùng chuỗi thô thì phải trả về
  đúng cùng một đối tượng, nếu không React dựng lại vô hạn. Bộ nhớ đệm theo khóa
  giữ cặp chuỗi thô và giá trị đã đọc.
*/
const cache = new Map<string, { raw: string | null; value: unknown }>();

function snapshot<T>(area: Area, key: string, parse: (raw: string | null) => T): T {
  const raw = readRaw(area, key);
  const hit = cache.get(`${area}:${key}`);
  if (hit && hit.raw === raw) return hit.value as T;
  const value = parse(raw);
  cache.set(`${area}:${key}`, { raw, value });
  return value;
}

function useStored<T>(area: Area, key: string, parse: (raw: string | null) => T, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => snapshot(area, key, parse),
    () => fallback,
  );
}

function parseJsonArray<T>(raw: string | null, ok: (x: unknown) => x is T): T[] {
  if (!raw) return EMPTY as T[];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter(ok) : (EMPTY as T[]);
  } catch {
    return EMPTY as T[];
  }
}

// Một mảng rỗng dùng chung, để ảnh chụp "chưa có gì" luôn là cùng một đối tượng.
const EMPTY: never[] = [];
const isString = (x: unknown): x is string => typeof x === "string";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(v: string): boolean {
  if (!ISO_DATE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Ngày hôm nay theo giờ máy người đọc, dạng ISO. */
export function todayIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ── Văn bản vừa xem ──────────────────────────────────────────────────────── */

const RECENT = "ll:recent";
const RECENT_MAX = 12;
const parseRecent = (raw: string | null) => parseJsonArray(raw, isString);

export function useRecentDocs(): string[] {
  return useStored("local", RECENT, parseRecent, EMPTY as string[]);
}

export function pushRecentDoc(id: string) {
  const list = parseRecent(readRaw("local", RECENT)).filter((x) => x !== id);
  writeRaw("local", RECENT, JSON.stringify([id, ...list].slice(0, RECENT_MAX)));
}

export function clearRecentDocs() {
  writeRaw("local", RECENT, null);
}

/* ── Văn bản đang theo dõi ────────────────────────────────────────────────── */

export interface Followed {
  id: string;
  /**
   * Ngày bắt đầu theo dõi. Trang theo dõi so ngày này với các mốc hiệu lực của
   * văn bản để nói điều gì đã đổi kể từ lúc đó.
   */
  since: string;
}

const FOLLOW = "ll:follow";
const isFollowed = (x: unknown): x is Followed =>
  !!x &&
  typeof x === "object" &&
  typeof (x as Followed).id === "string" &&
  typeof (x as Followed).since === "string";
const parseFollow = (raw: string | null) => parseJsonArray(raw, isFollowed);

export function useFollowed(): Followed[] {
  return useStored("local", FOLLOW, parseFollow, EMPTY as Followed[]);
}

export function toggleFollow(id: string): boolean {
  const list = parseFollow(readRaw("local", FOLLOW));
  const on = list.some((f) => f.id === id);
  const next = on ? list.filter((f) => f.id !== id) : [{ id, since: todayIso() }, ...list];
  writeRaw("local", FOLLOW, JSON.stringify(next));
  return !on;
}

/* ── Bộ hồ sơ ─────────────────────────────────────────────────────────────── */

/**
 * Một bộ hồ sơ: nhóm văn bản của cùng một vụ việc hay dự án. Chỉ gồm tên và
 * danh sách mã văn bản; mọi thông tin về văn bản đọc lại từ tập dữ liệu, không
 * chép vào đây, nên dữ liệu cập nhật là bộ hồ sơ cập nhật theo.
 */
export interface Matter {
  id: string;
  name: string;
  docIds: string[];
  created: string;
}

const MATTERS = "ll:matters";
const isMatter = (x: unknown): x is Matter =>
  !!x &&
  typeof x === "object" &&
  typeof (x as Matter).id === "string" &&
  typeof (x as Matter).name === "string" &&
  Array.isArray((x as Matter).docIds);
const parseMatters = (raw: string | null) => parseJsonArray(raw, isMatter);

export function useMatters(): Matter[] {
  return useStored("local", MATTERS, parseMatters, EMPTY as Matter[]);
}

function saveMatters(list: Matter[]) {
  writeRaw("local", MATTERS, JSON.stringify(list));
}

export function createMatter(name: string, firstDoc?: string): Matter {
  const m: Matter = {
    id: `m${Date.now().toString(36)}`,
    name: name.trim().slice(0, 80),
    docIds: firstDoc ? [firstDoc] : [],
    created: todayIso(),
  };
  saveMatters([m, ...parseMatters(readRaw("local", MATTERS))]);
  return m;
}

export function toggleMatterDoc(matterId: string, docId: string) {
  saveMatters(
    parseMatters(readRaw("local", MATTERS)).map((m) =>
      m.id !== matterId
        ? m
        : {
            ...m,
            docIds: m.docIds.includes(docId)
              ? m.docIds.filter((d) => d !== docId)
              : [...m.docIds, docId],
          },
    ),
  );
}

export function deleteMatter(matterId: string) {
  saveMatters(parseMatters(readRaw("local", MATTERS)).filter((m) => m.id !== matterId));
}

/* ── Câu tìm gần đây ──────────────────────────────────────────────────────── */

const SEARCHES = "ll:searches";
const parseSearches = (raw: string | null) => parseJsonArray(raw, isString);

export function useRecentSearches(): string[] {
  return useStored("local", SEARCHES, parseSearches, EMPTY as string[]);
}

export function pushRecentSearch(q: string) {
  const v = q.trim();
  if (v.length < 2) return;
  const list = parseSearches(readRaw("local", SEARCHES)).filter((x) => x !== v);
  writeRaw("local", SEARCHES, JSON.stringify([v, ...list].slice(0, 6)));
}

export function clearRecentSearches() {
  writeRaw("local", SEARCHES, null);
}

/* ── Ngày tra cứu: "pháp luật tại ngày…" ─────────────────────────────────── */

/*
  Ngày tra cứu giữ trong `sessionStorage`, không phải `localStorage`: người mở
  lại trang tuần sau không nên thấy mọi tình trạng đang tính theo một ngày của
  năm 2024 mà không nhớ mình đã đặt. Ngày cũng nằm trên địa chỉ trang ở tham số
  `ngay`, nên đường dẫn gửi cho đồng nghiệp mở ra đúng ngày đó.
*/
const ASOF = "ll:asof";
export const ASOF_PARAM = "ngay";
const parseAsOf = (raw: string | null) => (raw && isIsoDate(raw) ? raw : "");

export function useAsOf(): string {
  return useStored("session", ASOF, parseAsOf, "");
}

export function setAsOf(date: string) {
  const v = date && isIsoDate(date) ? date : "";
  writeRaw("session", ASOF, v || null);
  try {
    const url = new URL(window.location.href);
    if (v) url.searchParams.set(ASOF_PARAM, v);
    else url.searchParams.delete(ASOF_PARAM);
    window.history.replaceState(window.history.state, "", url);
  } catch {
    // Không đổi được địa chỉ thì ngày vẫn nằm trong phiên, chỉ không chia sẻ được.
  }
}

/** Đọc ngày từ địa chỉ trang khi trang mở; gọi một lần ở layout. */
export function syncAsOfFromUrl() {
  try {
    const v = new URL(window.location.href).searchParams.get(ASOF_PARAM);
    if (v && isIsoDate(v) && v !== readRaw("session", ASOF)) writeRaw("session", ASOF, v);
  } catch {
    // Bỏ qua.
  }
}

/** Gắn ngày tra cứu đang đặt vào một đường dẫn nội bộ. */
export function withAsOf(href: string, asOf: string): string {
  if (!asOf) return href;
  const [path, hash] = href.split("#");
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${ASOF_PARAM}=${asOf}${hash ? `#${hash}` : ""}`;
}
