// Lĩnh vực Dân sự, Án lệ và Quy tắc VIAC 2017: hiệu lực theo ngày, dự thảo án lệ
// tách khỏi kho, và câu trả lời tra cứu tự động tìm được án lệ theo số hiệu.
import assert from "node:assert/strict";
import { test } from "node:test";

import { documents, documentsById } from "@/data/documents";
import { auditDrafts, precedentDrafts } from "@/data/precedent-drafts";
import { offlineAnswer } from "@/lib/chat/offline";
import { validityAt } from "@/lib/validity";

const at = (id, date) => validityAt(documentsById.get(id), date);

test("viac: the 2017 Rules give way to the 2026 Rules on 1 July 2026", () => {
  assert.equal(at("viac-2017", "2020-01-01").state, "in-force");
  assert.equal(at("viac-2017", "2026-06-30").state, "in-force");
  const after = at("viac-2017", "2026-07-01");
  assert.equal(after.state, "expired");
  assert.equal(after.by.id, "viac-2026");
});

test("precedents: 08/2016/AL lapses when Resolution 01/2019 takes effect", () => {
  assert.equal(at("al-08-2016", "2018-01-01").state, "in-force");
  const v = at("al-08-2016", "2019-03-15");
  assert.equal(v.state, "expired");
  assert.equal(v.by.number, "01/2019/NQ-HĐTP");
});

test("precedents: a precedent applies only from its application date", () => {
  assert.equal(at("al-87-2026", "2026-06-30").state, "pending");
  assert.equal(at("al-87-2026", "2026-07-01").state, "in-force");
});

test("civil: the 2008 enforcement law is replaced by Law 106/2025/QH15", () => {
  const v = at("luat-thads-2008", "2026-10-01");
  assert.equal(v.state, "expired");
  assert.equal(v.by.number, "106/2025/QH15");
});

test("drafts: kept out of the corpus and pass their own gate", () => {
  assert.deepEqual(auditDrafts(precedentDrafts), []);
  const ids = new Set(documents.map((d) => d.id));
  for (const d of precedentDrafts) assert.ok(!ids.has(d.id), `${d.id} must not be in documents`);
  assert.ok(documents.every((d) => !/dự thảo/i.test(d.number)));
});

test("offline: a precedent number finds the precedent and what replaced it", () => {
  const a = offlineAnswer({ lang: "vi", text: "Án lệ 08/2016 còn áp dụng không?", domains: [] });
  assert.match(a, /08\/2016\/AL/);
  assert.match(a, /01\/2019\/NQ-HĐTP/);
});

test("offline: the precedents domain lists published precedents", () => {
  const a = offlineAnswer({ lang: "vi", text: "án lệ về đặt cọc", domains: ["an-le"] });
  assert.match(a, /\/AL/);
});
