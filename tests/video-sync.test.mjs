// Video giới thiệu: mọi số hiệu, lĩnh vực và con số trên màn hình phải khớp kho
// văn bản. Video được dựng từ `video/scene.js`, ngoài bản dựng của trang, nên
// phép thử này là chỗ duy nhất bắt được khi dữ liệu đổi mà video chưa đổi theo.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { documents, domains } from "@/data/documents";

const scene = readFileSync(new URL("../video/scene.js", import.meta.url), "utf8");

test("video: the areas match the dataset in order and colour", () => {
  const rows = [...scene.matchAll(/\{ id: '([a-z-]+)', hue: (\d+), short: '[^']+' \}/g)].map((m) => [m[1], Number(m[2])]);
  assert.deepEqual(rows, domains.map((d) => [d.id, d.hue]));
});

test("video: the counts on screen match the dataset", () => {
  const m = scene.match(/const STATS = \{ domains: ND, docs: (\d+), precedents: (\d+) \};/);
  assert.ok(m, "STATS block not found");
  assert.equal(Number(m[1]), documents.length);
  assert.equal(Number(m[2]), documents.filter((d) => d.type === "an-le").length);
});

test("video: every document number on screen is in the dataset", () => {
  const numbers = new Set(documents.map((d) => d.number));
  const onScreen = new Set(scene.match(/\d+\/\d{4}\/(?:QH\d+|AL|NĐ-CP)/g));
  for (const n of onScreen) assert.ok(numbers.has(n), `${n} is on screen but not in the dataset`);
});

test("video: scene starts and length come from one SYNC block", () => {
  const block = scene.split("/*SYNC*/")[1].split("/*END*/")[0];
  const data = JSON.parse(block.slice(block.indexOf("{"), block.lastIndexOf("}") + 1));
  assert.match(scene, new RegExp(`const TOTAL_BEATS = ${data.scenes.at(-1)};`));
  assert.ok(data.scenes.every((b, i) => i === 0 || b > data.scenes[i - 1]));
  assert.equal(data.glyphs.length, domains.length);
});
