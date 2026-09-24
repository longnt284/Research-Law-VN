import { documentsById, relations } from "@/data/documents";
import type { LegalDoc, RelationKind } from "@/data/types";
import { tierOf, whenOf } from "@/lib/corpus";

/**
 * Sợi văn bản: một dãy văn bản nối nhau bằng quan hệ có thật.
 *
 * Trang chủ vẽ tập dữ liệu thành những sợi xích chạy ngang. Mỗi mắt xích giữa
 * hai thẻ phải là một quan hệ có trong `relations`; không có mắt nào nối hai
 * văn bản chỉ vì chúng cùng lĩnh vực hay nằm cạnh nhau cho đẹp. File này là chỗ
 * duy nhất quyết định thẻ nào đứng cạnh thẻ nào.
 *
 * Chiều đọc cố định từ trái sang phải: văn bản bên phải tác động lên văn bản
 * bên trái. Luật đứng trước nghị định hướng dẫn nó, văn bản cũ đứng trước văn
 * bản thay thế nó, văn bản gốc đứng trước văn bản sửa đổi nó. Nhờ vậy một sợi
 * đọc ra đúng trình tự mà người làm hồ sơ vẫn lần: từ gốc xuống văn bản thi
 * hành, từ bản cũ sang bản mới.
 */

export interface StrandStep {
  doc: LegalDoc;
  /**
   * Mắt xích nối văn bản này với văn bản đứng ngay trước nó. Bỏ trống ở mắt đầu.
   *
   * `acts: "back"` nghĩa là văn bản này tác động lên văn bản bên trái (một nghị
   * định hướng dẫn luật đứng trước nó); `"forward"` là chiều ngược lại.
   */
  via?: { kind: RelationKind; acts: "back" | "forward" };
}

export type Strand = StrandStep[];

interface Link {
  /** Văn bản tác động: nghị định hướng dẫn, luật sửa đổi, văn bản thay thế. */
  from: string;
  /** Văn bản bị tác động. */
  to: string;
  kind: RelationKind;
  used: boolean;
}

function buildStrands(): Strand[] {
  const links: Link[] = relations.map((r) => ({ ...r, used: false }));
  const touching = new Map<string, Link[]>();
  for (const link of links) {
    for (const id of [link.from, link.to]) {
      const list = touching.get(id) ?? [];
      list.push(link);
      touching.set(id, list);
    }
  }

  const open = (id: string) => (touching.get(id) ?? []).filter((l) => !l.used);
  const other = (link: Link, id: string) => (link.from === id ? link.to : link.from);

  const byOrder = (a: string, b: string) => {
    const da = documentsById.get(a);
    const db = documentsById.get(b);
    if (!da || !db) return a.localeCompare(b);
    return tierOf(da) - tierOf(db) || whenOf(da).localeCompare(whenOf(db)) || a.localeCompare(b);
  };

  /*
    Mỗi sợi là một đường đơn: đi qua mỗi văn bản tối đa một lần, và đi qua mỗi
    quan hệ đúng một lần trong toàn bộ tập sợi. Một luật có nhiều nghị định
    hướng dẫn thì là điểm giao của nhiều sợi. Sợi dài nhất xuất hiện ở chỗ một
    luật sửa đổi nhiều luật cùng lúc bắc cầu giữa hai hệ văn bản — đúng chỗ mà
    đọc một văn bản tách khỏi hệ thống là đọc sai.

    Bước đi tham lam: từ đầu mút hiện tại, chọn quan hệ chưa dùng dẫn tới văn
    bản chưa có trong sợi và còn nhiều quan hệ mở nhất, để sợi đi tiếp được xa
    nhất. Đi hết một đầu thì quay sang nối dài đầu kia.
  */
  const grow = (path: string[], via: (Link | null)[], atEnd: boolean) => {
    for (;;) {
      const tip = atEnd ? path[path.length - 1] : path[0];
      const inPath = new Set(path);
      const choices = open(tip)
        .filter((l) => !inPath.has(other(l, tip)))
        .sort(
          (x, y) =>
            open(other(y, tip)).length - open(other(x, tip)).length ||
            byOrder(other(x, tip), other(y, tip)),
        );
      const pick = choices[0];
      if (!pick) return;
      pick.used = true;
      const next = other(pick, tip);
      if (atEnd) {
        path.push(next);
        via.push(pick);
      } else {
        path.unshift(next);
        via.splice(1, 0, pick);
        via[0] = null;
      }
    }
  };

  const strands: Strand[] = [];
  for (;;) {
    // Bắt đầu từ văn bản còn ít quan hệ mở nhất: đó thường là một đầu mút thật,
    // nên sợi không phải bắt đầu từ giữa rồi mọc về hai phía.
    const starts = [...touching.keys()]
      .filter((id) => open(id).length > 0)
      .sort((a, b) => open(a).length - open(b).length || byOrder(a, b));
    const start = starts[0];
    if (!start) break;
    const path = [start];
    const via: (Link | null)[] = [null];
    grow(path, via, true);
    grow(path, via, false);

    const strand: Strand = [];
    for (let i = 0; i < path.length; i++) {
      const doc = documentsById.get(path[i]);
      if (!doc) continue;
      const link = via[i];
      strand.push(
        link
          ? { doc, via: { kind: link.kind, acts: link.from === path[i] ? "back" : "forward" } }
          : { doc },
      );
    }
    if (strand.length > 1) strands.push(strand);
  }

  // Đọc từ trên xuống: nếu đầu phải của sợi đứng ở tầng hiệu lực cao hơn đầu
  // trái thì lật sợi, để phần lớn sợi mở đầu bằng văn bản cấp cao.
  return strands.map((strand) => {
    const first = strand[0].doc;
    const last = strand[strand.length - 1].doc;
    if (byOrder(first.id, last.id) <= 0) return strand;
    const flipped: Strand = [];
    for (let i = strand.length - 1; i >= 0; i--) {
      const link = strand[i + 1]?.via;
      flipped.push(
        link
          ? {
              doc: strand[i].doc,
              via: { kind: link.kind, acts: link.acts === "back" ? "forward" : "back" },
            }
          : { doc: strand[i].doc },
      );
    }
    return flipped;
  });
}

/** Mọi sợi của tập dữ liệu. Mỗi quan hệ có mặt trong đúng một sợi. */
export const strands: Strand[] = buildStrands();

/**
 * Chia sợi vào các làn chạy của trang chủ.
 *
 * Sợi dài xếp trước, mỗi sợi vào làn đang ngắn nhất, và một làn dừng nhận khi
 * đã đủ `perLane` thẻ. Giới hạn đó là giới hạn của trình duyệt chứ không phải
 * của dữ liệu: một làn chạy vòng phải được nhân đôi, và một dải vài chục nghìn
 * điểm ảnh chỉ để trang trí là thứ máy yếu phải trả giá.
 */
export function laneStrands(lanes: number, perLane: number): Strand[][] {
  const out: Strand[][] = Array.from({ length: lanes }, () => []);
  const size = new Array<number>(lanes).fill(0);
  const ranked = [...strands].sort((a, b) => b.length - a.length);
  for (const strand of ranked) {
    let best = -1;
    for (let i = 0; i < lanes; i++) {
      if (size[i] + strand.length > perLane) continue;
      if (best === -1 || size[i] < size[best]) best = i;
    }
    if (best === -1) continue;
    out[best].push(strand);
    size[best] += strand.length;
  }
  return out;
}

/**
 * Ví dụ tiêu biểu cho một loại quan hệ: cặp đầu tiên của loại đó mà cả hai văn
 * bản đều đã xác minh, ưu tiên văn bản cấp luật ở vế bị tác động.
 */
export function exampleOf(kind: RelationKind): { target: LegalDoc; actor: LegalDoc } | null {
  const candidates = relations
    .filter((r) => r.kind === kind)
    .map((r) => ({ target: documentsById.get(r.to), actor: documentsById.get(r.from) }))
    .filter((x): x is { target: LegalDoc; actor: LegalDoc } => !!x.target && !!x.actor);
  if (candidates.length === 0) return null;
  const score = (x: { target: LegalDoc; actor: LegalDoc }) =>
    (x.target.confidence === "verified" ? 0 : 2) +
    (x.actor.confidence === "verified" ? 0 : 2) +
    tierOf(x.target) +
    (x.actor.status === "expired" ? 1 : 0);
  return [...candidates].sort(
    (a, b) => score(a) - score(b) || whenOf(b.actor).localeCompare(whenOf(a.actor)),
  )[0];
}
