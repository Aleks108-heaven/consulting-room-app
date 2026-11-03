import { describe, expect, it } from "vitest";
import { appData } from "./appData";

const { quotes } = appData.quotes;
const publicDomain = quotes.filter((q) => q.status === "public-domain");
const inCopyright = quotes.filter((q) => q.status === "in-copyright");

// A public-domain quotation is allowed only if its author AND any translator died more than 70 years ago (public domain
// in the US and in life+70 countries such as the EU, Ukraine and Poland). Translators are listed here with the year
// they died; an unknown translator fails the test, so each one has to be checked before a quotation is added.
const NEWEST_ALLOWED_DEATH = 1955;
const TRANSLATOR_DEATH: Record<string, number> = {
  "A. A. Brill": 1948,
  "M. D. Eder": 1936,
  "J. E. Creighton and E. B. Titchener": 1927,
  "W. Béran Wolfe": 1935,
};

// In-copyright authors are quoted only briefly, with the work, year and a sourced reference.
const MAX_WORDS_IN_COPYRIGHT = 45;
const words = (s: string) => s.trim().split(/\s+/).length;

describe("psychology quotes", () => {
  it("has quotations in both groups, every one by a character in the app", () => {
    expect(publicDomain.length).toBeGreaterThan(0);
    expect(inCopyright.length).toBeGreaterThan(0);
    expect(publicDomain.length + inCopyright.length).toBe(quotes.length);
    for (const q of quotes) expect(appData.personaMeta.some((p) => p.n === q.person), q.person).toBe(true);
  });

  it("never repeats a quotation", () => {
    expect(new Set(quotes.map((q) => q.text)).size).toBe(quotes.length);
  });

  it("only quotes public-domain authors who died long enough ago", () => {
    for (const q of publicDomain) {
      const years = appData.personaMeta.find((p) => p.n === q.person)!.y;
      const death = Number(years.match(/-(\d{4})/)?.[1]);
      expect(Number.isFinite(death), `${q.person} has a death year`).toBe(true);
      expect(death, q.person).toBeLessThanOrEqual(NEWEST_ALLOWED_DEATH);
    }
  });

  it("only quotes public-domain translations whose translators died long enough ago", () => {
    for (const q of publicDomain.filter((x) => x.translator)) {
      const death = TRANSLATOR_DEATH[q.translator!];
      expect(death, `${q.person}: translator ${q.translator} is not in the checked list`).toBeTruthy();
      expect(death, q.translator).toBeLessThanOrEqual(NEWEST_ALLOWED_DEATH);
    }
  });

  it("keeps public-domain quotations short, clean and copied from named sources", () => {
    for (const q of publicDomain) {
      expect(q.text.length, q.person).toBeLessThanOrEqual(700);
      expect(q.text, q.person).not.toMatch(/_|\s{2,}|\p{L}- \p{Ll}|[{}]/u);
      for (const field of [q.work, q.year, q.source]) expect(field, q.person).toBeTruthy();
      expect(q.sourceUrls?.length, q.person).toBeGreaterThan(0);
      for (const url of q.sourceUrls!) expect(url, q.person).toMatch(/^https:\/\//);
    }
  });

  it("needs two independent scans for any public-domain text that is not on Project Gutenberg", () => {
    for (const q of publicDomain) {
      if (q.sourceUrls!.every((u) => !u.includes("gutenberg.org"))) {
        expect(q.sourceUrls!.length, q.person).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("keeps in-copyright quotations brief and traceable to a named work, year and reference", () => {
    for (const q of inCopyright) {
      expect(words(q.text), `${q.person}: "${q.text.slice(0, 40)}…" is too long`).toBeLessThanOrEqual(MAX_WORDS_IN_COPYRIGHT);
      expect(q.text, q.person).not.toMatch(/_|\s{2,}|[{}]|ﬁ|ﬂ/u);
      for (const field of [q.work, q.year, q.source]) expect(field, q.person).toBeTruthy();
      expect(q.year, q.person).toMatch(/^\d{4}$/);
      expect(q.sourceUrls, `${q.person}: in-copyright entries carry no free full-text links`).toBeUndefined();
      expect(q.citationUrls?.length, q.person).toBeGreaterThan(0);
      for (const url of q.citationUrls!) expect(url, q.person).toMatch(/^https:\/\/en\.(wikiquote|wikipedia)\.org\/wiki\//);
    }
  });

  it("gives each character at most a few in-copyright quotations", () => {
    const counts = new Map<string, number>();
    for (const q of inCopyright) counts.set(q.person, (counts.get(q.person) ?? 0) + 1);
    for (const [person, n] of counts) expect(n, person).toBeLessThanOrEqual(4);
  });

  it("does not show its verification links in the window", () => {
    const interfaceText = JSON.stringify(appData.languages.en.ui);
    for (const q of quotes) for (const url of [...(q.sourceUrls ?? []), ...(q.citationUrls ?? [])]) expect(interfaceText).not.toContain(url);
  });

  it("has the group headings and notes in every interface language", () => {
    for (const lang of appData.langs) {
      const ui = appData.languages[lang].ui as Record<string, string>;
      for (const key of ["quotes_h_quotes", "quotes_h_short", "quotes_short_note"]) expect(ui[key], `${lang}/${key}`).toBeTruthy();
    }
  });
});
