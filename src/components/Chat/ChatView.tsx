import { useEffect, useRef } from "react";
import { appData } from "../../lib/appData";
import { t } from "../../lib/i18n";
import { schoolLabel, personaText } from "../../lib/personas";
import { useAppState } from "../../state/AppStateContext";
import { MessageBubble, TypingBubble } from "./MessageBubble";
import { Composer } from "./Composer";

interface ChatViewProps {
  onAbout: () => void;
}

export function ChatView({ onAbout }: ChatViewProps) {
  const { lang, currentPersonaIdx, chatHistories, isTyping, liveMode, apiKey, goLibrary, clearChat } = useAppState();
  const scrollRef = useRef<HTMLDivElement>(null);

  const idx = currentPersonaIdx;
  const meta = idx != null ? appData.personaMeta[idx] : null;
  const txt = idx != null ? personaText(lang, idx) : null;
  const history = idx != null ? chatHistories[idx] || [] : [];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length, isTyping]);

  if (idx == null || !meta || !txt) return null;

  const school = schoolLabel(lang, meta.mode);
  const sameAsTag = school.toLowerCase().indexOf(txt.tag.toLowerCase()) > -1 || txt.tag.toLowerCase().indexOf(school.toLowerCase()) > -1;
  const metaLine = sameAsTag ? `${meta.y} · ${txt.tag}` : `${meta.y} · ${school} · ${txt.tag}`;
  const showLiveBadge = liveMode && !!apiKey;

  return (
    <div className="view" id="view-chat">
      <div className="chat-head">
        <button className="btn ghost small" onClick={goLibrary}>{t(lang, "chat_back")}</button>
        <div className="persona-id">
          <div className="name">{meta.n}</div>
          <div className="meta">{metaLine}</div>
        </div>
        {showLiveBadge && <span className="live-badge">{t(lang, "live_badge")}</span>}
        <button className="btn ghost small" onClick={clearChat}>{t(lang, "chat_clear")}</button>
      </div>
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-col">
          {history.map((m, i) => (
            <MessageBubble key={i} message={m} personaName={meta.n} />
          ))}
          {isTyping && <TypingBubble personaName={meta.n} />}
        </div>
      </div>
      <Composer key={idx} onAbout={onAbout} />
    </div>
  );
}
