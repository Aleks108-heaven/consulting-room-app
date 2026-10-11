import { beforeEach, describe, expect, it } from "vitest";
import { migratePersonaStorage, remapPersonaKeys } from "./personaMigration";
import { LS_PREFIX, lsGet } from "./storage";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
  };
});

const put = (key: string, value: unknown) => store.set(LS_PREFIX + key, JSON.stringify(value));

describe("remapPersonaKeys", () => {
  it("keeps characters 0-99, moves 126 and 128 to 100 and 101, and drops the removed teachers", () => {
    const out = remapPersonaKeys({ "0": "a", "99": "b", "100": "buddha", "101": "nagarjuna", "126": "goleman", "128": "davidson", "127": "kabat-zinn", "134": "norbu" });
    expect(out).toEqual({ "0": "a", "99": "b", "100": "goleman", "101": "davidson" });
  });

  it("drops keys that are not character numbers", () => {
    expect(remapPersonaKeys({ "-1": 1, x: 2, "1.5": 3, "7": 4 })).toEqual({ "7": 4 });
  });
});

describe("migratePersonaStorage", () => {
  it("re-keys saved chats once and records that it did", () => {
    put("chatHistories", { "15": [{ id: "1" }], "100": [{ id: "buddha" }], "126": [{ id: "goleman" }] });
    put("turnCounts", { "15": 3, "100": 9, "126": 2 });
    migratePersonaStorage();
    expect(lsGet("chatHistories", {})).toEqual({ "15": [{ id: "1" }], "100": [{ id: "goleman" }] });
    expect(lsGet("turnCounts", {})).toEqual({ "15": 3, "100": 2 });

    put("turnCounts", { "100": 5 }); // already in the new numbering; a second run must not touch it
    migratePersonaStorage();
    expect(lsGet("turnCounts", {})).toEqual({ "100": 5 });
  });

  it("does nothing harmful on a fresh install", () => {
    migratePersonaStorage();
    expect(store.has(LS_PREFIX + "chatHistories")).toBe(false);
  });
});
