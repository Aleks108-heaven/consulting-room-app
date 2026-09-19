import { t } from "../lib/i18n";
import { useAppState } from "../state/AppStateContext";
import { NavLink } from "./ui/NavLink";

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
        <span className="brand-mark" aria-hidden="true">🗂️</span>
        <div className="brand-text">
          <span className="brand-word">{t(lang, "brand_title")}</span>
          <span className="brand-sub label-caps">{t(lang, "brand_sub")}</span>
        </div>
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <NavLink onClick={onLineage}>{t(lang, "nav_lineage")}</NavLink>
        <NavLink onClick={onTraditions}>{t(lang, "nav_traditions")}</NavLink>
        <NavLink onClick={onAbout}>{t(lang, "nav_about")}</NavLink>
        <NavLink onClick={onSettings}>⚙ {t(lang, "nav_settings")}</NavLink>
      </div>
    </div>
  );
}
