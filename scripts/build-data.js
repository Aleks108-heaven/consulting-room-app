#!/usr/bin/env node
// Rebuilds the `window.APP_DATA = {...}` block inside www/index.html from
// data/core.json (shared, language-independent content) + i18n/<lang>.json
// (one file per language). Run after editing anything under data/ or i18n/.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const core = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "core.json"), "utf8"));
const i18nDir = path.join(ROOT, "i18n");

const files = fs.readdirSync(i18nDir).filter(f => f.endsWith(".json"));
const languages = {};
for (const f of files) {
  const lang = f.replace(/\.json$/, "");
  languages[lang] = JSON.parse(fs.readFileSync(path.join(i18nDir, f), "utf8"));
}

// Preserve a stable, curated language order (original four, then the newly
// added ones alphabetically); any language file not listed here is appended.
const ORDER = ["en", "uk", "es", "pl", "de", "it", "ca", "fr", "pt", "ro", "ru"];
const langs = ORDER.filter(l => languages[l]).concat(
  Object.keys(languages).filter(l => ORDER.indexOf(l) === -1).sort()
);

const appData = {
  langs,
  personaMeta: core.personaMeta,
  masterList: core.masterList,
  chainA: core.chainA,
  chainB: core.chainB,
  traditions: core.traditions,
  categoryOrder: core.categoryOrder,
  languages
};

const htmlPath = path.join(ROOT, "www", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");
const marker = "window.APP_DATA = ";
const start = html.indexOf(marker);
if (start === -1) throw new Error("window.APP_DATA marker not found in www/index.html");
const jsonStart = start + marker.length;
const scriptEnd = html.indexOf("</script>", jsonStart);
if (scriptEnd === -1) throw new Error("closing </script> not found after APP_DATA");
// the assignment ends at the last ';' before </script>
const semi = html.lastIndexOf(";", scriptEnd);

const before = html.slice(0, jsonStart);
const after = html.slice(semi); // keeps the trailing ";\n</script>..."
html = before + JSON.stringify(appData) + after;

fs.writeFileSync(htmlPath, html);
console.log(`Rebuilt www/index.html with languages: ${langs.join(", ")}`);
