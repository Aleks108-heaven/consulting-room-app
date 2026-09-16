import { appData } from "../../lib/appData";
import { t, fillUI } from "../../lib/i18n";
import { CR_PROVIDERS } from "../../lib/liveAi";
import { Modal } from "../Modal";
import { useAppState } from "../../state/AppStateContext";
import type { Provider, Theme } from "../../types";

const PROVIDER_TIPS: Record<Provider, string> = {
  gemini: "Free key at aistudio.google.com/apikey — no credit card.",
  groq: "Free key at console.groq.com/keys — very fast, no credit card.",
  openrouter: "Free key at openrouter.ai/keys — use models ending in :free.",
  anthropic: "Paid key from console.anthropic.com.",
  openai: "Any OpenAI-compatible endpoint; set the Base URL below.",
};

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    liveMode,
    setLiveMode,
    provider,
    setProvider,
    apiKey,
    setApiKey,
    apiBase,
    setApiBase,
    modelIds,
    setModelId,
    clearApiKey,
  } = useAppState();

  const cfg = CR_PROVIDERS[provider] || CR_PROVIDERS.anthropic;
  const activeModel = modelIds[provider] || "";

  return (
    <Modal open={open} onClose={onClose} title={t(lang, "settings_title")}>
      <p>{t(lang, "settings_intro")}</p>

      <div className="toggle-row">
        <div>
          <div className="t-label">{t(lang, "settings_language")}</div>
          <div className="t-desc">{t(lang, "settings_language_desc")}</div>
        </div>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={{ border: "1px solid var(--border-strong)", background: "var(--bg)", color: "var(--ink)", borderRadius: 8, padding: "6px 10px", fontSize: 13 }}
        >
          {appData.langs.map((l) => (
            <option key={l} value={l}>
              {appData.languages[l].label}
            </option>
          ))}
        </select>
      </div>

      <div className="toggle-row">
        <div>
          <div className="t-label">{t(lang, "settings_theme")}</div>
          <div className="t-desc">{t(lang, "settings_theme_desc")}</div>
        </div>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          style={{ border: "1px solid var(--border-strong)", background: "var(--bg)", color: "var(--ink)", borderRadius: 8, padding: "6px 10px", fontSize: 13 }}
        >
          <option value="system">{t(lang, "theme_system")}</option>
          <option value="light">{t(lang, "theme_light")}</option>
          <option value="dark">{t(lang, "theme_dark")}</option>
        </select>
      </div>

      <div className="toggle-row">
        <div>
          <div className="t-label">{t(lang, "settings_live")}</div>
          <div className="t-desc">{t(lang, "settings_live_desc")}</div>
        </div>
        <label className="switch">
          <input type="checkbox" checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} />
          <span className="slider" />
        </label>
      </div>

      {liveMode && (
        <div>
          <div className="field">
            <label htmlFor="provider-select">AI provider</label>
            <select
              id="provider-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              style={{ border: "1px solid var(--border-strong)", background: "var(--bg)", color: "var(--ink)", borderRadius: 8, padding: "8px 10px", fontSize: 13, width: "100%" }}
            >
              {(Object.keys(CR_PROVIDERS) as Provider[]).map((k) => (
                <option key={k} value={k}>
                  {CR_PROVIDERS[k].label}
                </option>
              ))}
            </select>
            <div className="hint">{PROVIDER_TIPS[provider] || ""}</div>
          </div>
          <div className="field">
            <label htmlFor="api-key">API key</label>
            <input
              type="password"
              id="api-key"
              placeholder={cfg.keyHint}
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value.trim())}
            />
            <div className="hint">Stored only on this device.</div>
          </div>
          <div className="field">
            <label htmlFor="model-id">
              Model ID <span style={{ color: "var(--ink-faint)" }}>(optional)</span>
            </label>
            <input
              type="text"
              id="model-id"
              placeholder={"default: " + cfg.defaultModel}
              value={activeModel}
              onChange={(e) => setModelId(provider, e.target.value.trim())}
            />
            <div className="hint">Leave blank to use {cfg.defaultModel}.</div>
          </div>
          {provider === "openai" && (
            <div className="field">
              <label htmlFor="api-base">Base URL</label>
              <input
                type="text"
                id="api-base"
                placeholder="https://api.openai.com/v1"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value.trim())}
              />
              <div className="hint">For any OpenAI-compatible endpoint.</div>
            </div>
          )}
          <div className="hint" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-soft-border)", padding: "10px 12px", borderRadius: 9 }}>
            In a browser tab, direct API calls may be blocked by CORS. The packaged Android / Windows app calls the provider natively, so Live mode works there.
          </div>
        </div>
      )}

      <div className="toggle-row" style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 14 }}>
        <div>
          <div className="t-label">{t(lang, "settings_install")}</div>
          <div className="t-desc">{t(lang, "settings_install_desc")}</div>
        </div>
      </div>
      <p className="hint" dangerouslySetInnerHTML={{ __html: fillUI(t(lang, "settings_install_steps"), { app: t(lang, "brand_title") }) }} />

      <div className="modal-foot" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <button className="btn small" onClick={clearApiKey}>{t(lang, "settings_clear_key")}</button>
        <button className="btn primary small" onClick={onClose}>{t(lang, "settings_done")}</button>
      </div>
    </Modal>
  );
}
