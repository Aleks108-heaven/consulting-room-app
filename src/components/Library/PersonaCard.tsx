import { appData } from "../../lib/appData";
import { personaText, schoolLabel } from "../../lib/personas";
import { useAppState } from "../../state/AppStateContext";

interface PersonaCardProps {
  idx: number;
  onOpen: () => void;
}

export function PersonaCard({ idx, onOpen }: PersonaCardProps) {
  const { lang } = useAppState();
  const meta = appData.personaMeta[idx];
  const txt = personaText(lang, idx);
  return (
    <button className="card" onClick={onOpen}>
      <div className="row-top">
        <span className="name">{meta.n}</span>
        <span className="years mono">{meta.y}</span>
      </div>
      <div className="tagline">{txt.tag}</div>
      <span className="chip">{schoolLabel(lang, meta.mode)}</span>
    </button>
  );
}
