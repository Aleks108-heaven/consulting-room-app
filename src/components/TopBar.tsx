import { t } from "../lib/i18n";
import { useAppState } from "../state/AppStateContext";

interface TopBarProps {
  onLineage: () => void;
  onTraditions: () => void;
  onAbout: () => void;
  onSettings: () => void;
}

export function TopBar({ onLineage, onTraditions, onAbout, onSettings }: TopBarProps) {
  const { lang } = useAppState();
  return (
    <div className="topbar">
      <div className="brand">
        <span className="mark">🗂️ {t(lang, "brand_title")}</span>
        <span className="sub">{t(lang, "brand_sub")}</span>
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <button className="btn ghost small" onClick={onLineage}>{t(lang, "nav_lineage")}</button>
        <button className="btn ghost small" onClick={onTraditions}>{t(lang, "nav_traditions")}</button>
        <button className="btn ghost small" onClick={onAbout}>{t(lang, "nav_about")}</button>
        <button className="btn ghost small" onClick={onSettings}>⚙ {t(lang, "nav_settings")}</button>
      </div>
    </div>
  );
}
