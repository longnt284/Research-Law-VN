/**
 * So sánh cơ học hai đoạn văn bản.
 *
 * Dùng cho ô đối chiếu nơi người đọc tự dán điều luật cũ và điều luật mới vào.
 * Phép so sánh này không hiểu pháp luật: nó chỉ tìm chuỗi từ chung dài nhất giữa
 * hai bên rồi đánh dấu phần thêm và phần bớt. Kết quả nói được "câu chữ khác
 * nhau ở đâu", không nói được "nghĩa đã đổi hay chưa" — hai điều đó không phải
 * lúc nào cũng đi cùng nhau, và trang có ghi rõ điều đó ngay cạnh ô nhập.
 */

export type SegmentType = "same" | "add" | "del";

export interface DiffSegment {
  type: SegmentType;
  text: string;
}

export interface DiffStats {
  same: number;
  added: number;
  removed: number;
  /** Tỷ lệ từ bị thêm hoặc bớt trên tổng số từ của hai bên, làm tròn phần trăm. */
  changedPercent: number;
  /** Đúng khi hai bên trùng nhau từng từ sau khi chuẩn hóa khoảng trắng. */
  identical: boolean;
  /** Đúng khi văn bản quá dài nên phải so sánh theo câu thay vì theo từ. */
  coarse: boolean;
}

export interface DiffResult {
  segments: DiffSegment[];
  stats: DiffStats;
}

/**
 * Ngưỡng an toàn cho bảng quy hoạch động.
 *
 * Thuật toán chuỗi con chung dài nhất tốn bộ nhớ theo tích số phần tử hai bên.
 * Với hai đoạn 1.200 từ, bảng đã là hơn một triệu ô — vẫn chạy được trong trình
 * duyệt. Vượt ngưỡng thì chuyển sang so theo câu: số phần tử giảm hàng chục lần,
 * đổi lại kết quả thô hơn, và giao diện nói rõ là đang ở chế độ thô.
 */
const MAX_CELLS = 1_600_000;

/** Tách theo từ, giữ lại khoảng trắng đứng sau mỗi từ để ghép lại không mất chữ. */
function tokeniseWords(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [];
}

/** Tách theo câu, dùng khi văn bản quá dài để so từng từ. */
function tokeniseSentences(text: string): string[] {
  return text.match(/[^.;:!?\n]+[.;:!?\n]*\s*/g) ?? [];
}

/** So khớp bỏ qua khác biệt về khoảng trắng và chữ hoa đầu dòng. */
function key(token: string): string {
  return token.trim().toLowerCase();
}

/**
 * Chuỗi con chung dài nhất, trả về dãy đoạn đã đánh dấu.
 *
 * Có cắt phần đầu và phần đuôi trùng nhau trước khi dựng bảng. Hai bản của cùng
 * một điều luật thường chỉ khác nhau ở giữa, nên bước cắt này thường giảm kích
 * thước bảng xuống còn vài phần trăm.
 */
function diffTokens(a: string[], b: string[]): DiffSegment[] {
  let head = 0;
  while (head < a.length && head < b.length && key(a[head]) === key(b[head])) head++;

  let tail = 0;
  while (
    tail < a.length - head &&
    tail < b.length - head &&
    key(a[a.length - 1 - tail]) === key(b[b.length - 1 - tail])
  ) {
    tail++;
  }

  const midA = a.slice(head, a.length - tail);
  const midB = b.slice(head, b.length - tail);

  const out: DiffSegment[] = [];
  const push = (type: SegmentType, text: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += text;
    else out.push({ type, text });
  };

  push("same", a.slice(0, head).join(""));

  if (midA.length === 0 || midB.length === 0) {
    push("del", midA.join(""));
    push("add", midB.join(""));
  } else {
    const n = midA.length;
    const m = midB.length;
    // Bảng (n+1)×(m+1) phẳng, một ô một số nguyên 32 bit.
    const table = new Int32Array((n + 1) * (m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        table[i * (m + 1) + j] =
          key(midA[i]) === key(midB[j])
            ? table[(i + 1) * (m + 1) + j + 1] + 1
            : Math.max(table[(i + 1) * (m + 1) + j], table[i * (m + 1) + j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (key(midA[i]) === key(midB[j])) {
        push("same", midA[i]);
        i++;
        j++;
      } else if (table[(i + 1) * (m + 1) + j] >= table[i * (m + 1) + j + 1]) {
        push("del", midA[i]);
        i++;
      } else {
        push("add", midB[j]);
        j++;
      }
    }
    push("del", midA.slice(i).join(""));
    push("add", midB.slice(j).join(""));
  }

  push("same", a.slice(a.length - tail).join(""));
  return out;
}

/** So sánh hai đoạn văn bản, tự hạ xuống mức câu khi văn bản quá dài. */
export function diffText(before: string, after: string): DiffResult {
  let a = tokeniseWords(before);
  let b = tokeniseWords(after);
  let coarse = false;

  if (a.length * b.length > MAX_CELLS) {
    a = tokeniseSentences(before);
    b = tokeniseSentences(after);
    coarse = true;
  }

  const segments =
    a.length * b.length > MAX_CELLS
      ? [
          { type: "del" as SegmentType, text: before },
          { type: "add" as SegmentType, text: after },
        ]
      : diffTokens(a, b);

  const count = (type: SegmentType) =>
    segments
      .filter((s) => s.type === type)
      .reduce((n, s) => n + (s.text.match(/\S+/g)?.length ?? 0), 0);

  const same = count("same");
  const added = count("add");
  const removed = count("del");
  const total = same + added + removed;

  return {
    segments,
    stats: {
      same,
      added,
      removed,
      changedPercent: total === 0 ? 0 : Math.round(((added + removed) / total) * 100),
      identical: added === 0 && removed === 0 && total > 0,
      coarse,
    },
  };
}
