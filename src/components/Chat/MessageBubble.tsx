import { initials } from "../../lib/personas";
import type { ChatMessage } from "../../types";

interface MessageBubbleProps {
  message: ChatMessage;
  personaName: string;
}

export function MessageBubble({ message, personaName }: MessageBubbleProps) {
  const cls =
    message.role === "user" ? "user" : message.role === "system" ? "system" : message.role === "crisis" ? "crisis" : "clinician";
  const showAvatar = message.role !== "user";
  return (
    <div className={`msg ${cls}`}>
      {showAvatar && (
        <div className="avatar">{message.role === "system" || message.role === "crisis" ? "ⓘ" : initials(personaName)}</div>
      )}
      <div className="bubble">{message.text}</div>
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
