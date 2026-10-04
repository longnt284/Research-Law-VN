// Đợt bổ sung 03/10/2026: ba lĩnh vực Sở hữu trí tuệ, Thương mại quốc tế & Hải
// quan, Cạnh tranh & Người tiêu dùng, cùng các chuỗi thay thế đọc trên vbpl.vn.
import assert from "node:assert/strict";
import { test } from "node:test";

import { documents, documentsById, domains } from "@/data/documents";
import { offlineAnswer } from "@/lib/chat/offline";
import { validityAt } from "@/lib/validity";

const at = (id, date) => validityAt(documentsById.get(id), date);
const NEW_DOMAINS = ["so-huu-tri-tue", "thuong-mai-quoc-te", "canh-tranh"];

test("scope: the three new domains are declared and each holds its pillar instruments", () => {
  const ids = domains.map((d) => d.id);
  for (const id of NEW_DOMAINS) {
    assert.ok(ids.includes(id), `${id} is not declared`);
    assert.ok(documents.filter((d) => d.domains.includes(id)).length >= 8, `${id} has fewer than 8 instruments`);
  }
  assert.ok(documentsById.get("luat-shtt-2005"));
  assert.ok(documentsById.get("luat-hai-quan-2014"));
  assert.ok(documentsById.get("luat-canh-tranh-2018").domains.includes("canh-tranh"));
});

test("scope: hues of the new domains are distinct from every other domain", () => {
  const hues = domains.map((d) => d.hue);
  assert.equal(new Set(hues).size, hues.length);
});

test("civil status: the 2014 Law gives way to Law 03/2026/QH16 on 1 March 2027", () => {
  assert.equal(at("luat-ho-tich-2014", "2027-02-28").state, "in-force");
  const v = at("luat-ho-tich-2014", "2027-03-01");
  assert.equal(v.state, "expired");
  assert.equal(v.by.number, "03/2026/QH16");
});

test("e-commerce: Decree 52/2013/NĐ-CP ends when Decree 248/2026/NĐ-CP takes effect", () => {
  assert.notEqual(at("nd-52-2013", "2026-06-30").state, "expired");
  const v = at("nd-52-2013", "2026-07-01");
  assert.equal(v.state, "expired");
  assert.equal(v.by.number, "248/2026/NĐ-CP");
});

test("foreign trade: Decree 69/2018/NĐ-CP is replaced by Decree 292/2026/NĐ-CP from 5 September 2026", () => {
  assert.equal(at("nd-69-2018", "2026-09-04").state, "in-force");
  assert.equal(at("nd-69-2018", "2026-09-05").by.number, "292/2026/NĐ-CP");
});

test("re-verification: decrees repealed in full on vbpl.vn no longer read as in force", () => {
  assert.equal(at("nd-225-2025", "2026-08-21").by.number, "274/2026/NĐ-CP");
  assert.equal(at("nd-19-2025", "2026-03-31").by.number, "96/2026/NĐ-CP");
});

test("offline: a customs question finds the Customs Law", () => {
  const a = offlineAnswer({ lang: "vi", text: "Luật Hải quan 54/2014/QH13 còn hiệu lực không?", domains: ["thuong-mai-quoc-te"] });
  assert.match(a, /54\/2014\/QH13/);
});
