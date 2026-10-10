import type { CSSProperties } from "react";
import { appData } from "../../lib/appData";
import { fillUI, t } from "../../lib/i18n";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";

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

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "quotes_title")} maxWidth={760}>
      <p>{t(lang, "quotes_intro")}</p>
      <p style={mutedStyle}>{t(lang, "quotes_english_note")}</p>

      <h3 style={sectionStyle}>{t(lang, "quotes_h_quotes")}</h3>
      {quotes.map((q) => (
        <section key={q.person} style={sectionStyle}>
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
      ))}

      <p style={{ ...mutedStyle, ...sectionStyle }}>{fillUI(t(lang, "quotes_none"), { count: String(withoutQuote) })}</p>
      <p style={mutedStyle}>{t(lang, "quotes_licence")}</p>
    </Modal>
  );
}
