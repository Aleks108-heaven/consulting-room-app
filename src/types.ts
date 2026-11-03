export interface PersonaMeta {
  n: string;
  y: string;
  mode: string;
}

export interface PersonaText {
  tag: string;
  voice: string;
  terms: string[];
}

export interface ModeData {
  label?: string;
  openers: string[];
  reflect: string[];
  technique: string[];
}

export interface CategoryInfo {
  kw: string[];
  topic?: string;
}

export interface LanguagePack {
  label: string;
  ui: Record<string, string>;
  modes: Record<string, ModeData>;
  personas: PersonaText[];
  categories: Record<string, CategoryInfo>;
  masterTagOverride?: Record<string, string>;
  chainANotes?: string[];
  chainBNotes?: string[];
  chainANames?: string[];
  chainBNames?: string[];
  terms?: TermsText;
}

export interface ListRow {
  num: number;
  personaIdx: number;
}

export interface ChainItem {
  personaIdx: number;
}

export interface AppData {
  langs: string[];
  personaMeta: PersonaMeta[];
  masterList: ListRow[];
  chainA: ChainItem[];
  chainB: ChainItem[];
  categoryOrder: string[];
  terms: TermsData;
  quotes: QuotesData;
  languages: Record<string, LanguagePack>;
}

export type ChatRole = "user" | "clinician" | "system" | "crisis";

export type ReplySource = "scripted" | "live";

export interface ChatMessage {
  /** Stable React key. Absent on history saved before this field existed. */
  id?: string;
  role: ChatRole;
  text: string;
  /** Only set for clinician/crisis replies — which engine produced this text. */
  source?: ReplySource;
  /** The app's own words about the simulation (not spoken in character): never shown in quotation marks. */
  notice?: boolean;
}

/** An English rendering of a term; `by` says who uses it (omitted when no single source is named). */
export interface TermRendering {
  text: string;
  by?: string;
}

export interface TermEntry {
  key: string;
  /** The term in its original language, e.g. "Besetzung". */
  original: string;
  /** Language code of `original`; its label is shown beside it. */
  originalLang: string;
  renderings: TermRendering[];
}

export interface TermSource {
  author: string;
  title: string;
  detail: string;
}

export interface TermsData {
  terms: TermEntry[];
  sources: TermSource[];
}

/** Per-language term text, keyed by term key. Missing entries fall back to English. */
export interface TermsText {
  names?: Record<string, string>;
  short?: Record<string, string>;
  varies?: Record<string, string>;
}

export type QuoteStatus = "public-domain" | "in-copyright";

/** A quotation. `sourceUrls` and `citationUrls` are for verification only and are never shown. */
export interface QuoteEntry {
  /** public-domain: copied word for word from a free full text. in-copyright: a short quotation whose citation is checked against a sourced reference. */
  status: QuoteStatus;
  person: string;
  work: string;
  year: string;
  part?: string;
  translator?: string;
  source: string;
  /** Free full texts the quotation is verified against (public-domain entries). */
  sourceUrls?: string[];
  /** Sourced references the citation is checked against (in-copyright entries). */
  citationUrls?: string[];
  text: string;
}

export interface QuotesData {
  quotes: QuoteEntry[];
}

export type Theme = "system" | "light" | "dark";

export type Provider = "anthropic" | "gemini" | "groq" | "openrouter" | "openai";

export interface ProviderConfig {
  label: string;
  defaultModel: string;
  keyHint: string;
}
