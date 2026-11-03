#!/usr/bin/env node
// Manual check (needs network; not run in CI): node scripts/verify-quotes.js
// Re-fetches every source of every quotation in data/quotes.json and confirms the quotation appears there word for
// word. A quotation with several sources (independent scans of the same book) must appear in every one of them.
// Whitespace, Project Gutenberg italics markers and line-break hyphenation ("with- out", or "with¬ out" in some scans)
// are ignored; nothing else is.
// Exits non-zero if anything cannot be found.
const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "quotes.json"), "utf8"));
const UA = { headers: { "User-Agent": "Mozilla/5.0 (quote verification for a study app)" } };

const norm = (s) =>
  s.replace(/\r/g, "").replace(/_/g, "").replace(/(\p{L})[-¬]\s+(?=\p{Ll})/gu, "$1").replace(/\s+/g, " ").trim();

// In-copyright quotations have no free full text to compare with, so their citation is checked against the sourced
// entries of Wikiquote / Wikipedia instead (raw wikitext, with its markup removed). This confirms the wording and that
// a reference names it; it does not replace checking the printed book.
const wikiRaw = (url) => {
  const m = url.match(/^https:\/\/en\.(wikiquote|wikipedia)\.org\/wiki\/(.+)$/);
  return m ? `https://en.${m[1]}.org/w/index.php?title=${m[2]}&action=raw` : url;
};
const unwiki = (s) => s.replace(/<br\s*\/?>/gi, " ").replace(/'{2,}/g, "").replace(/ﬁ/g, "fi").replace(/ﬂ/g, "fl");

const cache = new Map();
async function sourceText(url, wiki) {
  const key = (wiki ? "wiki:" : "") + url;
  if (!cache.has(key)) {
    const r = await fetch(wiki ? wikiRaw(url) : url, UA);
    if (!r.ok) throw new Error(`${r.status} for ${url}`);
    const body = await r.text();
    cache.set(key, norm(wiki ? unwiki(body) : body));
  }
  return cache.get(key);
}

(async () => {
  const problems = [];
  let checks = 0;
  for (const q of data.quotes) {
    const want = norm(q.text);
    const wiki = q.status === "in-copyright";
    for (const url of wiki ? q.citationUrls : q.sourceUrls) {
      checks++;
      let ok = false;
      try {
        ok = (await sourceText(url, wiki)).includes(want);
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
