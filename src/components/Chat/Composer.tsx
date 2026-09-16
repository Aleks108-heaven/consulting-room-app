import { useEffect, useRef, useState } from "react";
import { t } from "../../lib/i18n";
import { useAppState } from "../../state/AppStateContext";

interface ComposerProps {
  onAbout: () => void;
}

export function Composer({ onAbout }: ComposerProps) {
  const { lang, sendMessage } = useAppState();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) setTimeout(() => el.focus(), 50);
  }, []);

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  function handleSend() {
    const text = value.trim();
    if (!text) return;
    sendMessage(text);
    setValue("");
    requestAnimationFrame(autoGrow);
  }

  return (
    <div className="composer">
      <div className="composer-col">
        <div className="composer-row">
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            placeholder={t(lang, "composer_placeholder")}
            onChange={(e) => {
              setValue(e.target.value);
              autoGrow();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="send-btn" aria-label="Send" onClick={handleSend}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
            </svg>
          </button>
        </div>
        <div className="disclaimer-line">
          <span>{t(lang, "disclaimer_line")}</span> <button onClick={onAbout}>{t(lang, "disclaimer_full_link")}</button>
        </div>
      </div>
    </div>
  );
}
