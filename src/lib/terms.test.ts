import { describe, expect, it } from "vitest";
import { appData } from "./appData";
import { termsText } from "./terms";

const keys = appData.terms.terms.map((t) => t.key);

describe("psychology terms", () => {
  it("has English names, glosses and 'where it varies' text for every term", () => {
    const en = termsText("en");
    for (const key of keys) {
      for (const part of [en.names, en.short, en.varies]) {
        expect(part[key], key).toBeTruthy();
        expect(part[key], key).not.toMatch(/[{}]|^terms\./);
      }
    }
  });

  it("is complete in Ukrainian and falls back to English elsewhere", () => {
    const uk = appData.languages.uk.terms;
    for (const key of keys) {
      for (const part of [uk?.names, uk?.short, uk?.varies]) expect(part?.[key], `uk ${key}`).toBeTruthy();
    }
    for (const lang of appData.langs) {
      const text = termsText(lang);
      for (const key of keys) expect(text.names[key], `${lang} ${key}`).toBeTruthy();
    }
  });

  it("keeps Ukrainian free of Russian letters", () => {
    const uk = appData.languages.uk;
    const all = [
      ...Object.values(uk.terms?.names ?? {}),
      ...Object.values(uk.terms?.short ?? {}),
      ...Object.values(uk.terms?.varies ?? {}),
      ...Object.entries(uk.ui).filter(([k]) => /^(terms|quotes)_|^nav_(terms|quotes)$/.test(k)).map(([, v]) => v),
    ].join(" ");
    expect(all).not.toMatch(/[ыэъё]/i);
  });

  it("gives every rendering some text, with no repeats inside one term", () => {
    for (const term of appData.terms.terms) {
      expect(term.renderings.length, term.key).toBeGreaterThan(0);
      const texts = term.renderings.map((r) => r.text);
      expect(new Set(texts).size, term.key).toBe(texts.length);
      for (const r of term.renderings) expect(r.text.trim(), term.key).toBeTruthy();
    }
  });

  it("names the original term and a language the app can label", () => {
    for (const term of appData.terms.terms) {
      expect(term.original, term.key).toBeTruthy();
      expect(appData.languages[term.originalLang]?.label, term.key).toBeTruthy();
    }
  });

  it("cites its sources as plain text, with no links", () => {
    expect(appData.terms.sources.length).toBeGreaterThan(0);
    const everything = JSON.stringify(appData.terms);
    expect(everything).not.toMatch(/https?:\/\//);
  });
});
