import { describe, expect, it } from "vitest";
import { appData } from "./appData";

const { quotes } = appData.quotes;

// A quotation is allowed only if its author AND any translator died more than 70 years ago (public domain
// in the US and in life+70 countries such as the EU, Ukraine and Poland). Translators are listed here with the year
// they died; an unknown translator fails the test, so each one has to be checked before a quotation is added.
const NEWEST_ALLOWED_DEATH = 1955;
const TRANSLATOR_DEATH: Record<string, number> = {
  "A. A. Brill": 1948,
  "J. E. Creighton and E. B. Titchener": 1927,
  "W. Béran Wolfe": 1935,
};

describe("psychology quotes", () => {
  it("has quotations, each by a character in the app", () => {
    expect(quotes.length).toBeGreaterThan(0);
    for (const q of quotes) expect(appData.personaMeta.some((p) => p.n === q.person), q.person).toBe(true);
  });

  it("only quotes authors who died long enough ago", () => {
    for (const q of quotes) {
      const years = appData.personaMeta.find((p) => p.n === q.person)!.y;
      const death = Number(years.match(/-(\d{4})/)?.[1]);
      expect(Number.isFinite(death), `${q.person} has a death year`).toBe(true);
      expect(death, q.person).toBeLessThanOrEqual(NEWEST_ALLOWED_DEATH);
    }
  });

  it("only quotes translations whose translators died long enough ago", () => {
    for (const q of quotes.filter((x) => x.translator)) {
      const death = TRANSLATOR_DEATH[q.translator!];
      expect(death, `${q.person}: translator ${q.translator} is not in the checked list`).toBeTruthy();
      expect(death, q.translator).toBeLessThanOrEqual(NEWEST_ALLOWED_DEATH);
    }
  });

  it("is short, clean text copied from named sources", () => {
    for (const q of quotes) {
      expect(q.text.length, q.person).toBeLessThanOrEqual(700);
      expect(q.text, q.person).not.toMatch(/_|\s{2,}|\p{L}- \p{Ll}|[{}]/u);
      for (const field of [q.work, q.year, q.source]) expect(field, q.person).toBeTruthy();
      expect(q.sourceUrls.length, q.person).toBeGreaterThan(0);
      for (const url of q.sourceUrls) expect(url, q.person).toMatch(/^https:\/\//);
    }
  });

  it("needs two independent scans for any text that is not on Project Gutenberg", () => {
    for (const q of quotes) {
      if (q.sourceUrls.every((u) => !u.includes("gutenberg.org"))) {
        expect(q.sourceUrls.length, q.person).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("does not show its verification links in the window", () => {
    const interfaceText = JSON.stringify(appData.languages.en.ui);
    for (const q of quotes) for (const url of q.sourceUrls) expect(interfaceText).not.toContain(url);
  });
});
