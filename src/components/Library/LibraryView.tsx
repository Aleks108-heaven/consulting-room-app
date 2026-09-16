import { useMemo } from "react";
import { appData } from "../../lib/appData";
import { t, fillUI } from "../../lib/i18n";
import { personaIdxByName, personaText, schoolLabel } from "../../lib/personas";
import { useAppState } from "../../state/AppStateContext";
import { PersonaCard } from "./PersonaCard";

interface LibraryViewProps {
  onLineage: () => void;
}

function matches(lang: string, idx: number, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  const meta = appData.personaMeta[idx];
  const txt = personaText(lang, idx);
  return (
    meta.n.toLowerCase().indexOf(lower) > -1 ||
    txt.tag.toLowerCase().indexOf(lower) > -1 ||
    schoolLabel(lang, meta.mode).toLowerCase().indexOf(lower) > -1 ||
    txt.terms.join(" ").toLowerCase().indexOf(lower) > -1
  );
}

export function LibraryView({ onLineage }: LibraryViewProps) {
  const { lang, search, setSearch, school, setSchool, openPersona } = useAppState();

  const schoolOptions = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    appData.personaMeta.forEach((p) => {
      if (!seen.has(p.mode)) {
        seen.add(p.mode);
        order.push(p.mode);
      }
    });
    order.sort((a, b) => schoolLabel(lang, a).localeCompare(schoolLabel(lang, b)));
    return order;
  }, [lang]);

  const visibleIdx = useMemo(() => {
    const q = search.trim();
    return appData.personaMeta
      .map((_, i) => i)
      .filter((i) => (!school || appData.personaMeta[i].mode === school) && matches(lang, i, q));
  }, [lang, search, school]);

  const perlsBtn = (
    <button className="btn ghost small" style={{ padding: "2px 8px" }} onClick={() => openPersona(personaIdxByName("Fritz Perls"))}>
      Fritz Perls
    </button>
  );
  const lineageBtn = (
    <button className="btn ghost small" style={{ padding: "2px 8px" }} onClick={onLineage}>
      {t(lang, "nav_lineage")}
    </button>
  );
  const bannerText = fillUI(t(lang, "lineage_banner_text"), { perls: "__PERLS__", lineage: "__LINEAGE__" });
  const bannerParts = bannerText.split(/(__PERLS__|__LINEAGE__)/);

  return (
    <div className="view" id="view-library">
      <div className="library-head">
        <h1>{t(lang, "lib_h1")}</h1>
        <p className="lede">
          {t(lang, "lib_lede")}{" "}
          <button className="btn ghost small" style={{ padding: "2px 8px" }} onClick={onLineage}>
            {t(lang, "lib_read_disclaimer")}
          </button>
        </p>
        <div className="toolbar">
          <div className="search-box">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(lang, "search_placeholder")}
              autoComplete="off"
            />
          </div>
          <select className="school-filter" value={school} onChange={(e) => setSchool(e.target.value)}>
            <option value="">{t(lang, "filter_all_schools")}</option>
            {schoolOptions.map((m) => (
              <option key={m} value={m}>
                {schoolLabel(lang, m)}
              </option>
            ))}
          </select>
          <span className="count-pill">
            {visibleIdx.length} / {appData.personaMeta.length}
          </span>
        </div>
      </div>
      <div className="library-scroll">
        <div className="lineage-banner">
          <span style={{ fontSize: 20 }}>🪑</span>
          <div className="txt">
            <b>{t(lang, "lineage_banner_new_here")}</b>{" "}
            {bannerParts.map((part, i) =>
              part === "__PERLS__" ? (
                <span key={i}>{perlsBtn}</span>
              ) : part === "__LINEAGE__" ? (
                <span key={i}>{lineageBtn}</span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        </div>
        <div className="grid">
          {visibleIdx.map((i) => (
            <PersonaCard key={i} idx={i} onOpen={() => openPersona(i)} />
          ))}
        </div>
        {visibleIdx.length === 0 && <div className="empty-state">{t(lang, "empty_state")}</div>}
      </div>
    </div>
  );
}
