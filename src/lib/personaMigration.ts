import { isRecord, lsGet, lsSet } from "./storage";

// Chats, turn counts and chat languages are saved per character *index*. When the Buddhist
// teachers moved to their own app, 33 characters left the end of the list and two psychologists
// (Goleman, Davidson) moved up from 126/128 to 100/101, so saved data from before must be
// re-keyed once; otherwise a chat with the Buddha would reopen as a chat with Goleman.
const LAYOUT_KEY = "personaLayout";
const LAYOUT = "psychology-only";
const FIRST_REMOVED = 100;
const MOVED: Readonly<Record<number, number>> = { 126: 100, 128: 101 };
const PERSONA_KEYED = ["chatHistories", "turnCounts", "historyLang"] as const;

/** Keeps entries for characters 0-99, moves the two re-numbered ones, and drops everything else. */
export function remapPersonaKeys(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    const idx = Number(key);
    if (!Number.isInteger(idx) || idx < 0) continue;
    if (idx < FIRST_REMOVED) out[key] = value;
    else if (idx in MOVED) out[String(MOVED[idx])] = value;
  }
  return out;
}

/** Runs once per install, before the app state reads its saved chats. */
export function migratePersonaStorage(): void {
  if (lsGet<string>(LAYOUT_KEY, "") === LAYOUT) return;
  for (const key of PERSONA_KEYED) {
    const saved = lsGet<Record<string, unknown> | null>(key, null, (v) => (isRecord(v) ? v : undefined));
    if (saved) lsSet(key, remapPersonaKeys(saved));
  }
  lsSet(LAYOUT_KEY, LAYOUT);
}
