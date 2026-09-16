import { appData } from "./appData";
import { L, t, fillUI } from "./i18n";
import { modeData, personaText, lowerFirst } from "./personas";
import type { ChatMessage } from "../types";

// In-memory only (matches original behaviour): which template indices have
// already been used for a given persona/key/language this session, so the
// scripted engine doesn't repeat itself while the app is open.
const usedTemplates: Record<string, number[]> = {};

function shuffle<T>(a: T[]): T[] {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(arr: string[], idx: number, key: string, lang: string): string {
  const stateKey = `${idx}_${key}_${lang}`;
  if (!usedTemplates[stateKey] || !usedTemplates[stateKey].length) {
    usedTemplates[stateKey] = shuffle(arr.map((_, i) => i));
  }
  const i = usedTemplates[stateKey].pop()!;
  return arr[i];
}

export function categories(lang: string) {
  const l = L(lang);
  return l.categories || appData.languages.en.categories;
}

export function detectCategory(lang: string, text: string): string {
  const lower = text.toLowerCase();
  const cats = categories(lang);
  for (const cat of appData.categoryOrder) {
    const c = cats[cat] || appData.languages.en.categories[cat];
    const kws = c.kw;
    for (const kw of kws) {
      if (lower.indexOf(kw) > -1) return cat;
    }
  }
  return "general";
}

export function fillTemplate(tpl: string, persona: { terms: string[] }, topic: string): string {
  return tpl
    .replace(/\{topic\}/g, topic)
    .replace(/\{t1\}/g, persona.terms[0] || topic)
    .replace(/\{t2\}/g, persona.terms[1] || persona.terms[0] || topic)
    .replace(/\{t3\}/g, persona.terms[2] || persona.terms[0] || topic);
}

export function openerFor(lang: string, idx: number): string {
  const meta = appData.personaMeta[idx];
  const mode = modeData(lang, meta.mode);
  return pick(mode.openers, idx, "opener", lang);
}

export function introFor(lang: string, idx: number): string {
  const meta = appData.personaMeta[idx];
  const txt = personaText(lang, idx);
  return fillUI(t(lang, "msg_intro"), {
    name: meta.n,
    life: meta.y,
    tagline: lowerFirst(txt.tag),
    voice: txt.voice,
  });
}

export function respond(
  lang: string,
  idx: number,
  userText: string,
  turn: number
): ChatMessage {
  const meta = appData.personaMeta[idx];
  const txt = personaText(lang, idx);
  const mode = modeData(lang, meta.mode);
  const cat = detectCategory(lang, userText);

  if (cat === "crisis") return { role: "crisis", text: t(lang, "crisis") };
  if (cat === "about") {
    return {
      role: "clinician",
      text: fillUI(t(lang, "msg_about_template"), {
        name: meta.n,
        life: meta.y,
        tagline_lower: lowerFirst(txt.tag),
      }),
    };
  }
  if (cat === "greeting" && turn <= 1) {
    return { role: "clinician", text: pick(mode.openers, idx, "opener", lang) };
  }
  if (cat === "farewell") {
    return { role: "clinician", text: t(lang, "msg_farewell") };
  }

  const cats = categories(lang);
  const topicInfo = cats[cat];
  const topic = (topicInfo && topicInfo.topic) || t(lang, "topic_fallback");
  const useTechnique = turn >= 2 && Math.random() < 0.4;
  const bank = useTechnique
    ? mode.technique
    : turn === 1
    ? mode.openers
    : Math.random() < 0.55
    ? mode.reflect
    : mode.openers;
  const bankKey = useTechnique ? "technique" : bank === mode.openers ? "opener" : "reflect";
  const tpl = pick(bank, idx, bankKey, lang);
  const text = fillTemplate(tpl, txt, topic);
  return { role: "clinician", text };
}
