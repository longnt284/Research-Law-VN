"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  type Followed,
  type Matter,
  readAccount,
  readFollowed,
  readMatters,
  replaceUserData,
  setAccount,
} from "@/lib/client-store";

/**
 * Tài khoản người dùng, dựa trên Supabase: Supabase Auth giữ email và mật khẩu,
 * hai bảng `follows` và `matters` giữ văn bản đang theo dõi và bộ hồ sơ (xem
 * `supabase/migrations`). Row Level Security bảo đảm mỗi người chỉ đọc, ghi
 * được hàng của mình, nên trang gọi thẳng cơ sở dữ liệu từ trình duyệt bằng
 * khóa công khai mà không cần máy chủ trung gian.
 *
 * Thư viện Supabase chỉ được nạp khi cần: khi mở trang tài khoản, hoặc khi
 * trình duyệt đang có phiên đăng nhập. Người không dùng tài khoản không tải
 * byte nào của nó.
 *
 * Dữ liệu trên màn hình vẫn đọc từ bộ nhớ trình duyệt (`client-store`); lớp này
 * chỉ đồng bộ bộ nhớ đó với máy chủ:
 *
 * - Lần đầu đăng nhập trên một trình duyệt: gộp những gì đã lưu khi chưa đăng
 *   nhập vào tài khoản, rồi đẩy lên.
 * - Những lần sau: máy chủ là bản gốc, kéo về thay bộ nhớ trình duyệt.
 * - Mỗi lần người dùng đổi dữ liệu: đẩy toàn bộ danh sách lên (dữ liệu nhỏ, đẩy
 *   cả danh sách đơn giản và khó sai hơn đẩy từng thay đổi).
 */

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Tài khoản có được bật trên bản dựng này không (đủ hai biến môi trường). */
export const ACCOUNTS_ENABLED = SB_URL.startsWith("https://") && KEY.length > 20;

let client: Promise<SupabaseClient> | null = null;

export function supabase(): Promise<SupabaseClient> {
  if (!ACCOUNTS_ENABLED) return Promise.reject(new Error("accounts disabled"));
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SB_URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }),
  );
  return client;
}

/** Có dấu vết phiên đăng nhập trong trình duyệt không, kiểm mà không nạp thư viện. */
export function hasStoredSession(): boolean {
  if (!ACCOUNTS_ENABLED) return false;
  try {
    const ref = new URL(SB_URL).hostname.split(".")[0];
    return !!window.localStorage.getItem(`sb-${ref}-auth-token`);
  } catch {
    return false;
  }
}

/**
 * Header xác thực cho API của trang (lượt Pro, thanh toán): access token của
 * phiên hiện tại. Máy chủ hỏi lại Supabase Auth để xác minh token. Không đăng
 * nhập thì trả về rỗng.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  if (!hasStoredSession()) return {};
  try {
    const { data } = await (await supabase()).auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

const SYNCED = "ll:synced-user";

type FollowRow = { doc_id: string; since: string };
type MatterRow = { id: string; name: string; doc_ids: string[]; created: string };

async function pull(sb: SupabaseClient): Promise<{ followed: Followed[]; matters: Matter[] }> {
  const [f, m] = await Promise.all([
    sb.from("follows").select("doc_id, since").order("created_at", { ascending: false }),
    sb.from("matters").select("id, name, doc_ids, created").order("updated_at", { ascending: false }),
  ]);
  if (f.error) throw f.error;
  if (m.error) throw m.error;
  return {
    followed: (f.data as FollowRow[]).map((r) => ({ id: r.doc_id, since: r.since })),
    matters: (m.data as MatterRow[]).map((r) => ({
      id: r.id,
      name: r.name,
      docIds: r.doc_ids,
      created: r.created,
    })),
  };
}

/*
  Cùng dạng mã với ràng buộc của bảng (xem `supabase/migrations`). Danh sách đọc
  từ bộ nhớ trình duyệt, ai cũng sửa tay được, nên lọc trước khi gửi: một mã
  chứa dấu phẩy hay dấu ngoặc sẽ làm sai nghĩa bộ lọc `not in (...)` ghép bên
  dưới.
*/
const DOC_ID = /^[a-z0-9-]{1,120}$/;
const MATTER_ID = /^[a-z0-9]{1,40}$/;
const isDocId = (v: unknown): v is string => typeof v === "string" && DOC_ID.test(v);

/** Thay dữ liệu trên máy chủ bằng đúng danh sách đang có trong trình duyệt. */
async function push(sb: SupabaseClient, userId: string) {
  const followed = readFollowed().filter((f) => isDocId(f.id));
  const matters = readMatters()
    .filter((m) => MATTER_ID.test(m.id))
    .map((m) => ({ ...m, docIds: m.docIds.filter(isDocId) }));

  if (followed.length) {
    const { error } = await sb
      .from("follows")
      .upsert(followed.map((f) => ({ user_id: userId, doc_id: f.id, since: f.since })));
    if (error) throw error;
  }
  const keepF = followed.map((f) => f.id);
  const delF = sb.from("follows").delete().eq("user_id", userId);
  const rf = await (keepF.length ? delF.not("doc_id", "in", `(${keepF.join(",")})`) : delF);
  if (rf.error) throw rf.error;

  if (matters.length) {
    const { error } = await sb.from("matters").upsert(
      matters.map((m) => ({
        user_id: userId,
        id: m.id,
        name: m.name,
        doc_ids: m.docIds,
        created: m.created,
        updated_at: new Date().toISOString(),
      })),
    );
    if (error) throw error;
  }
  const keepM = matters.map((m) => m.id);
  const delM = sb.from("matters").delete().eq("user_id", userId);
  const rm = await (keepM.length ? delM.not("id", "in", `(${keepM.join(",")})`) : delM);
  if (rm.error) throw rm.error;
}

function merge(local: { followed: Followed[]; matters: Matter[] }, server: { followed: Followed[]; matters: Matter[] }) {
  const f = new Map<string, Followed>();
  for (const x of [...server.followed, ...local.followed]) {
    const prev = f.get(x.id);
    // Giữ ngày theo dõi sớm hơn: người dùng đã theo dõi từ ngày đó.
    if (!prev || x.since < prev.since) f.set(x.id, x);
  }
  const m = new Map<string, Matter>();
  for (const x of [...server.matters, ...local.matters]) {
    const prev = m.get(x.id);
    m.set(x.id, prev ? { ...prev, docIds: [...new Set([...prev.docIds, ...x.docIds])] } : x);
  }
  return { followed: [...f.values()], matters: [...m.values()] };
}

/** Đồng bộ ngay sau khi có phiên đăng nhập (mở trang, hoặc vừa đăng nhập). */
export async function syncOnSignIn(user: User) {
  const sb = await supabase();
  setAccount({ id: user.id, email: user.email ?? "" });
  const server = await pull(sb);
  let synced: string | null = null;
  try {
    synced = window.localStorage.getItem(SYNCED);
  } catch {
    // Không đọc được bộ nhớ: coi như lần đầu, gộp thay vì ghi đè.
  }
  if (synced) {
    // Máy chủ là bản gốc. Mã của tài khoản khác nghĩa là bộ nhớ đang giữ dữ liệu
    // của tài khoản trước (phiên cũ hết hạn mà chưa đăng xuất), không phải dữ
    // liệu lưu khi chưa đăng nhập, nên không gộp vào tài khoản này.
    replaceUserData(server.followed, server.matters);
    if (synced !== user.id) rememberSynced(user.id);
    return;
  }
  const merged = merge({ followed: readFollowed(), matters: readMatters() }, server);
  replaceUserData(merged.followed, merged.matters);
  await push(sb, user.id);
  rememberSynced(user.id);
}

function rememberSynced(userId: string) {
  try {
    window.localStorage.setItem(SYNCED, userId);
  } catch {
    // Lần sau sẽ gộp lại; gộp hai lần cho cùng kết quả.
  }
}

/**
 * Mọi dữ liệu tài khoản đang giữ về người dùng, đọc thẳng từ máy chủ, để người
 * dùng tải về: email, ngày tạo tài khoản, văn bản theo dõi, bộ hồ sơ và bằng
 * chứng đồng ý chính sách.
 */
export async function exportMyData(user: User) {
  const sb = await supabase();
  const [data, consents] = await Promise.all([
    pull(sb),
    sb.from("consents").select("policy_version, accepted_at").order("accepted_at"),
  ]);
  if (consents.error) throw consents.error;
  return {
    exported_at: new Date().toISOString(),
    account: { email: user.email ?? "", created_at: user.created_at },
    followed: data.followed,
    matters: data.matters,
    consents: consents.data,
  };
}

let pending: number | null = null;

/** Đẩy thay đổi lên máy chủ, gom các lần bấm liên tiếp thành một lần gửi. */
export function schedulePush() {
  const account = readAccount();
  if (!account) return;
  if (pending) window.clearTimeout(pending);
  pending = window.setTimeout(async () => {
    pending = null;
    try {
      const sb = await supabase();
      await push(sb, account.id);
    } catch (e) {
      console.warn("Lex & Lineage: không đồng bộ được với tài khoản", e);
    }
  }, 600);
}

/**
 * Đăng xuất: xóa phiên, và xóa danh sách theo dõi, bộ hồ sơ khỏi trình duyệt
 * này — máy dùng chung không được giữ lại dữ liệu của người vừa đăng xuất.
 */
export async function signOut() {
  const sb = await supabase();
  await sb.auth.signOut();
  setAccount(null);
  replaceUserData(null, null);
  try {
    window.localStorage.removeItem(SYNCED);
  } catch {
    // Bỏ qua.
  }
}
