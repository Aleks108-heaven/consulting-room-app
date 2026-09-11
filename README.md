# Consulting Room — Android + Windows app

A study companion for the history of psychotherapy. The whole app is one file:
[`www/index.html`](www/index.html) (persona library, chat UI, scripted engine, i18n,
theming). This repo wraps it as a native app for **Android** (Capacitor) and
**Windows** (Tauri 2), and adds a **provider‑agnostic Live AI mode**.

---

## What changed vs. the original single file

- `tryLiveReply()` was replaced with `crProviderReply()` — a small layer that speaks
  to **Anthropic, Google Gemini, Groq, OpenRouter, or any OpenAI‑compatible endpoint**.
- Settings now has an **AI provider** dropdown, an optional **Model ID**, and an
  optional **Base URL** (for OpenAI‑compatible servers). Key + settings are stored
  on‑device only (localStorage).
- Network calls go through the **native HTTP bridge** (Capacitor `CapacitorHttp` /
  Tauri `http` plugin) so they are **not blocked by browser CORS** in the packaged apps.
  A plain `fetch` fallback is kept for running in a normal browser tab.

Nothing else about the app’s behaviour changed. With Live AI mode **off** it is 100%
offline and identical to the original.

---

## Choosing a free AI provider

| Provider | Free tier | Get a key | Default model |
|---|---|---|---|
| **Google Gemini** ✅ recommended | Generous, **no credit card** | https://aistudio.google.com/apikey | `gemini-2.5-flash` |
| **Groq** ✅ very fast | Generous, no credit card | https://console.groq.com/keys | `llama-3.3-70b-versatile` |
| **OpenRouter** | Use models ending in `:free` | https://openrouter.ai/keys | `meta-llama/llama-3.3-70b-instruct:free` |
| **Anthropic** | Paid only | https://console.anthropic.com | `claude-haiku-4-5` |
| **OpenAI‑compatible** | depends on host | — | set Base URL + Model |

> ⚠️ **Do not ship your own key inside a distributed build** — it can be extracted
> from the APK / EXE. For public distribution, have each user paste their own free
> key (the Settings UI already supports this), or run a tiny proxy (e.g. Cloudflare
> Workers free tier) that holds the key. Embedding your key is fine for **personal
> use only**.

---

## Prerequisites

- **Node.js 18+** and npm
- **Android build:** Android Studio (SDK + platform tools), JDK 17
- **Windows build:** [Rust](https://rustup.rs/) + “Desktop development with C++”
  workload from the Visual Studio Build Tools, and WebView2 runtime (preinstalled on
  Windows 11)

```bash
cd consulting-room-app
npm install
```

---

## Windows (Tauri)

```bash
# one-time: generate icons from any square PNG (>= 512x512)
npx @tauri-apps/cli icon path/to/logo.png   # writes src-tauri/icons/*

# run in dev
npm run win:dev

# build installers -> src-tauri/target/release/bundle/{nsis,msi}/
npm run win:build
```

If `window.__TAURI__.http` is unavailable at runtime, Live mode falls back to
`fetch`; keep `withGlobalTauri: true` in `src-tauri/tauri.conf.json` (already set) so
the http bridge is exposed without a bundler.

---

## Android (Capacitor)

```bash
# one-time
npm run android:add          # creates the android/ project
#   put a 512x512 icon via Android Studio's Image Asset wizard, or use
#   npx @capacitor/assets generate --iconBackgroundColor '#EDF0EC'

# after any change to www/
npm run android:sync

# open in Android Studio to run on a device/emulator or build an AAB
npm run android:open
```

`CapacitorHttp` is enabled in `capacitor.config.json`, which routes `fetch` through
native code and bypasses CORS. Internet permission is included by Capacitor by default.

To produce a release AAB for Play Store: Android Studio → Build → Generate Signed
Bundle, or `cd android && ./gradlew bundleRelease`.

---

## Project layout

```
consulting-room-app/
├─ www/index.html            # the entire app (edit this)
├─ capacitor.config.json     # Android config
├─ package.json              # build scripts
└─ src-tauri/                # Windows (Tauri 2)
   ├─ tauri.conf.json
   ├─ Cargo.toml
   ├─ capabilities/default.json   # allow-list of API hosts
   └─ src/{main,lib}.rs
```

## Updating the app

Edit `www/index.html`, then `npm run android:sync` and/or `npm run win:build`.
