import type { CSSProperties } from "react";
import { appData } from "../../lib/appData";
import { fillUI, t } from "../../lib/i18n";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";
import type { QuoteEntry } from "../../types";

interface QuotesModalProps {
  open: boolean;
  onClose: () => void;
}

const mutedStyle: CSSProperties = { color: "var(--ink-muted)", fontSize: "var(--fs-sm)" };
const sectionStyle: CSSProperties = { marginTop: "var(--space-3)" };
const quoteStyle: CSSProperties = {
  margin: "var(--space-1) 0",
  paddingLeft: "var(--space-2)",
  borderLeft: "3px solid var(--amber-subtle-border)",
  fontFamily: "var(--font-serif)",
};

export function QuotesModal({ open, onClose }: QuotesModalProps) {
  const { lang } = useAppState();
  const { quotes } = appData.quotes;
  const years = (name: string) => appData.personaMeta.find((p) => p.n === name)?.y;
  const withoutQuote = appData.personaMeta.length - new Set(quotes.map((q) => q.person)).size;
  const publicDomain = quotes.filter((q) => q.status === "public-domain");
  const shortQuotations = quotes.filter((q) => q.status === "in-copyright");

  const renderQuote = (q: QuoteEntry, i: number) => (
    <section key={`${q.person}-${i}`} style={sectionStyle}>
      <p style={{ marginBottom: 0 }}>
        <strong>{q.person}</strong>
        {years(q.person) ? <span style={mutedStyle}> · {years(q.person)}</span> : null}
      </p>
      <blockquote style={quoteStyle}>{q.text}</blockquote>
      <p style={mutedStyle}>
        <em>{q.work}</em> ({q.year}){q.part ? `, ${q.part}` : ""}
        {q.translator ? ` — ${t(lang, "quotes_translated_by")} ${q.translator}` : ""} — {q.source}
      </p>
    </section>
  );

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "quotes_title")} maxWidth={760}>
      <p style={mutedStyle}>{t(lang, "quotes_english_note")}</p>

      <h3 style={sectionStyle}>{t(lang, "quotes_h_quotes")}</h3>
      <p>{t(lang, "quotes_intro")}</p>
      {publicDomain.map(renderQuote)}
      <p style={{ ...mutedStyle, ...sectionStyle }}>{t(lang, "quotes_licence")}</p>

      <h3 style={sectionStyle}>{t(lang, "quotes_h_short")}</h3>
      <p style={mutedStyle}>{t(lang, "quotes_short_note")}</p>
      {shortQuotations.map(renderQuote)}

      <p style={{ ...mutedStyle, ...sectionStyle }}>{fillUI(t(lang, "quotes_none"), { count: String(withoutQuote) })}</p>
    </Modal>
  );
}
