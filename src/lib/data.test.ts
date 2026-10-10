import { describe, expect, it } from "vitest";
import { appData } from "./appData";

describe("content data", () => {
  it("has all 135 characters, each with a name, years and a school that exists in English", () => {
    expect(appData.personaMeta.length).toBe(135);
    const en = appData.languages.en;
    for (const p of appData.personaMeta) {
      expect(p.n, "name").toBeTruthy();
      expect(p.y, p.n).toBeTruthy();
      expect(en.modes[p.mode], `${p.n}: school ${p.mode}`).toBeTruthy();
    }
    expect(en.personas.length).toBe(appData.personaMeta.length);
  });

  it("points every list and lineage entry at a real character, or at none (-1: a name without a chat)", () => {
    const n = appData.personaMeta.length;
    for (const row of [...appData.masterList, ...appData.traditions]) {
      expect(row.personaIdx, `row ${row.num}`).toBeGreaterThanOrEqual(-1);
      expect(row.personaIdx, `row ${row.num}`).toBeLessThan(n);
    }
    for (const c of [...appData.chainA, ...appData.chainB]) {
      expect(c.personaIdx).toBeGreaterThanOrEqual(-1);
      expect(c.personaIdx).toBeLessThan(n);
    }
  });

  it("gives every language crisis wording and the menu labels", () => {
    for (const lang of appData.langs) {
      const pack = appData.languages[lang];
      expect(pack.categories.crisis?.kw?.length, `${lang} crisis keywords`).toBeGreaterThan(0);
      for (const key of ["nav_lineage", "nav_terms", "nav_quotes", "nav_traditions", "nav_about", "nav_settings"]) {
        expect(pack.ui[key], `${lang} ${key}`).toBeTruthy();
      }
    }
  });

  it("uses only categories that exist in English", () => {
    for (const cat of appData.categoryOrder) expect(appData.languages.en.categories[cat], cat).toBeTruthy();
  });
});
