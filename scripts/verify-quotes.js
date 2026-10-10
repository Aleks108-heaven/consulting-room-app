#!/usr/bin/env node
// Manual check (needs network; not run in CI): node scripts/verify-quotes.js
// Re-fetches every source of every quotation in data/quotes.json and confirms the quotation appears there word for
// word. A quotation with several sources (independent scans of the same book) must appear in every one of them.
// Whitespace, Project Gutenberg italics markers and line-break hyphenation ("with- out") are ignored; nothing else is.
// Exits non-zero if anything cannot be found.
const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "quotes.json"), "utf8"));
const UA = { headers: { "User-Agent": "Mozilla/5.0 (quote verification for a study app)" } };

const norm = (s) =>
  s.replace(/\r/g, "").replace(/_/g, "").replace(/(\p{L})-\s+(?=\p{Ll})/gu, "$1").replace(/\s+/g, " ").trim();

const cache = new Map();
async function sourceText(url) {
  if (!cache.has(url)) {
    const r = await fetch(url, UA);
    if (!r.ok) throw new Error(`${r.status} for ${url}`);
    cache.set(url, norm(await r.text()));
  }
  return cache.get(url);
}

(async () => {
  const problems = [];
  let checks = 0;
  for (const q of data.quotes) {
    const want = norm(q.text);
    for (const url of q.sourceUrls) {
      checks++;
      let ok = false;
      try {
        ok = (await sourceText(url)).includes(want);
      } catch (e) {
        problems.push(`${q.person}: could not fetch ${url} (${e.message})`);
        console.log(`ERR ${q.person} — ${url}`);
        continue;
      }
      console.log(`${ok ? "ok " : "BAD"} ${q.person} — ${url}`);
      if (!ok) problems.push(`${q.person}: not found verbatim at ${url}`);
    }
  }
  console.log(`\n${checks} checks, ${problems.length} problem(s)`);
  for (const p of problems) console.log("  - " + p);
  process.exit(problems.length ? 1 : 0);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
