import { t } from "../../lib/i18n";
import { initials } from "../../lib/personas";
import type { ChatMessage } from "../../types";

interface MessageBubbleProps {
  message: ChatMessage;
  personaName: string;
  lang: string;
}

export function MessageBubble({ message, personaName, lang }: MessageBubbleProps) {
  const cls =
    message.role === "user" ? "user" : message.role === "system" ? "system" : message.role === "crisis" ? "crisis" : "clinician";
  const showAvatar = message.role !== "user";
  // Missing source only happens for chat history saved before this field existed —
  // all of that was necessarily scripted (Live mode never wrote messages back then).
  const showSourceBadge = message.role === "clinician";
  const source = message.source || "scripted";
  return (
    <div className={`msg ${cls}`}>
      {showAvatar && (
        <div className="avatar">{message.role === "system" || message.role === "crisis" ? "ⓘ" : initials(personaName)}</div>
      )}
      <div>
        {showSourceBadge && (
          <div className="reply-source">{t(lang, source === "live" ? "live_badge" : "scripted_badge")}</div>
        )}
        <div className="bubble">{message.text}</div>
      </div>
    </div>
  );
}

export function TypingBubble({ personaName }: { personaName: string }) {
  return (
    <div className="msg clinician">
      <div className="avatar">{initials(personaName)}</div>
      <div className="bubble">
        <span className="typing">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}
