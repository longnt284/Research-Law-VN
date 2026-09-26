import { documents, documentsById, LATEST_VERIFIED_ON } from "@/data/documents";
import type { LegalDoc } from "@/data/types";
import { lapseWithParent, startOf } from "@/lib/validity";

/**
 * Dòng thay đổi của cả kho văn bản.
 *
 * Mỗi mục là một mốc đọc thẳng từ bản ghi: văn bản được ban hành, có hiệu lực,
 * sửa đổi, thay thế hoặc hướng dẫn văn bản khác, hay hết hiệu lực cùng văn bản
 * mà nó sửa. Không mục nào được thêm tay, và không có mốc "hết hiệu lực" nào
 * mang ngày đoán: văn bản chỉ biết là đã hết hiệu lực ở ngày tra cứu thì không có
 * mặt ở đây.
 *
 * Mốc của một quan hệ là ngày văn bản tác động bắt đầu có hiệu lực, vì đó là
 * ngày quan hệ bắt đầu có hệ quả pháp lý.
 */

export type ChangeEventKind = "issued" | "effective" | "amended" | "replaced" | "expired" | "guidance";

export interface ChangeEvent {
  id: string;
  date: string;
  kind: ChangeEventKind;
  /** Văn bản tác động (hoặc văn bản có mốc, với ban hành và có hiệu lực). */
  doc: LegalDoc;
  /** Văn bản bị tác động. */
  targets: LegalDoc[];
}

function existing(ids: readonly string[] | undefined): LegalDoc[] {
  return (ids ?? []).map((id) => documentsById.get(id)).filter((d): d is LegalDoc => !!d);
}

function build(): ChangeEvent[] {
  const out: ChangeEvent[] = [];
  const push = (e: Omit<ChangeEvent, "id">) => out.push({ ...e, id: `${e.kind}-${e.doc.id}` });

  for (const doc of documents) {
    if (doc.issuedOn && doc.issuedOn !== doc.effectiveOn) {
      push({ date: doc.issuedOn, kind: "issued", doc, targets: [] });
    }
    const start = startOf(doc);
    if (!start) continue;
    const replaces = existing(doc.replaces);
    const amends = existing(doc.amends);
    const guides = existing(doc.guides);
    if (replaces.length) push({ date: start, kind: "replaced", doc, targets: replaces });
    if (amends.length) push({ date: start, kind: "amended", doc, targets: amends });
    if (guides.length) push({ date: start, kind: "guidance", doc, targets: guides });
    if (!replaces.length && !amends.length && !guides.length && doc.effectiveOn) {
      push({ date: doc.effectiveOn, kind: "effective", doc, targets: [] });
    }
    const lapse = lapseWithParent(doc);
    if (lapse) push({ date: lapse.date, kind: "expired", doc, targets: [lapse.parent] });
  }

  // Mới nhất trước; cùng ngày thì thay thế, sửa đổi đứng trước hướng dẫn và ban hành.
  const ORDER: Record<ChangeEventKind, number> = {
    replaced: 0,
    amended: 1,
    expired: 2,
    effective: 3,
    guidance: 4,
    issued: 5,
  };
  return out.sort(
    (a, b) => b.date.localeCompare(a.date) || ORDER[a.kind] - ORDER[b.kind] || a.doc.number.localeCompare(b.doc.number),
  );
}

export const changeEvents: ChangeEvent[] = build();

/**
 * Mốc chia "đã diễn ra" và "sắp có hiệu lực": ngày tra cứu gần nhất của kho.
 * Dùng ngày dữ liệu thay vì ngày dựng trang, để câu "sắp có hiệu lực" luôn đúng
 * với chính dữ liệu đang hiển thị.
 */
export const CHANGES_AS_OF = LATEST_VERIFIED_ON;

export function recentChanges(past: number, upcoming: number) {
  const future = changeEvents
    .filter((e) => e.date > CHANGES_AS_OF && e.kind !== "issued")
    .reverse()
    .slice(0, upcoming);
  const done = changeEvents.filter((e) => e.date <= CHANGES_AS_OF).slice(0, past);
  return { future, done };
}
