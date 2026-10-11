# Consulting Room — Android + Windows app

A study companion for the history of psychotherapy: a persona library, chat UI,
scripted conversation engine, i18n, and theming, built with **Vite + React +
TypeScript**. This repo wraps it as a native app for **Android** (Capacitor) and
**Windows** (Tauri 2), and adds a **provider‑agnostic Live AI mode**.

The app used to ship as a single 800KB `www/index.html` file. It has since been
migrated to a proper source layout under `src/` — `www/` is now a **build output
directory** (gitignored, produced by `npm run build`), not source. See
[Project layout](#project-layout) below.

Consulting Room contains **only** psychologists, psychotherapists and the people associated with
them (**102** characters). The Buddhist, Tibetan and Dzogchen teachers (33 of them, with a Dzogchen
lineage, terms, quotes and mantras) are a separate app in their own repo:
[traditions-of-the-mind-app](https://github.com/Aleks108-heaven/traditions-of-the-mind-app).

---

## Status and known gaps

- **Tested:** typecheck, unit tests, and scripted walkthroughs in a headless browser (phone and
  desktop sizes, light and dark, all 11 languages). The **Android and Windows builds are produced by
  CI and have not been run on a device** by the maintainer.
- **Live AI** was tested only against a local mock server, not against a real provider.
- **Translations** of the app's text were written with AI assistance and have **not been reviewed
  by native speakers**. Only English, Spanish, Polish and Ukrainian have per-character dialogue; the
  other languages show the English text for each character.
- **Psychology terms** are in English and Ukrainian (other languages show the English content with
  translated labels). **Quotes**: only five psychologists have a quotation, because the rest are
  still in copyright (see [Quotes](#quotes)).
- **Licence:** no licence has been chosen, so by default all rights are reserved.
- This is an educational simulation: not the real people, not therapy, not a clinician.

---

## Live AI mode

- `crProviderReply()` (`src/lib/liveAi.ts`) is a small provider-agnostic layer that
  speaks to **Anthropic, Google Gemini, Groq, OpenRouter, or any OpenAI‑compatible
  endpoint**.
- Settings has an **AI provider** dropdown, an optional **Model ID**, and an
  optional **Base URL** (for OpenAI‑compatible servers). Key + settings are stored
  on‑device only (localStorage).
- On **Android**, network calls go through Capacitor's native HTTP bridge (`CapacitorHttp`),
  so browser CORS does not apply. In a **browser tab and in the Windows app** the app uses the
  webview's own `fetch`, so the provider must allow cross-origin requests (the five listed
  providers do). Every call is bounded by a client-side timeout so a hung request can't leave
  the chat stuck on the typing indicator.
- **Crisis messages never reach a provider.** Before anything is sent, the message is checked
  against the crisis wording of all 11 languages (whatever the interface language is). A match
  gets the fixed crisis reply with crisis-line guidance, and no request is made
  (`src/lib/liveGate.ts`).
- The system prompt names the character and the interface language, tells the model it is a
  simulation (not the real person, not a licensed clinician), and asks it to drop the role and
  point to real crisis resources if the user expresses self-harm. A model can still ignore
  instructions, so treat Live AI replies as unverified.
- If the provider fails (HTTP error, timeout, no network), the chat shows one short note and
  answers from the scripted engine instead.

With Live AI mode **off** the app is 100% offline, using the scripted engine only.

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

## Security notes

- **Chat rendering is XSS-safe.** Every message (yours and the AI's) is rendered by React
  as text; the app never uses `dangerouslySetInnerHTML` or `innerHTML`.
- **API keys live only in `localStorage`** on the device; they're never bundled
  into the app and never sent anywhere except straight to the provider you chose.
- **Windows (Tauri):** the app ships a Content-Security-Policy (`src-tauri/tauri.conf.json`).
  The Tauri HTTP plugin is registered and scoped to the five providers' hosts in
  `src-tauri/capabilities/default.json`, but the app's Live AI client currently uses the
  webview's `fetch`, not that plugin, so the CSP is what limits outbound connections.
- **CI workflow** (`.github/workflows/build.yml`) triggers on push to `main` (and one older
  branch), on pull requests to `main` and on manual dispatch (no `pull_request_target`), uses no
  repo secrets, and its `GITHUB_TOKEN` is scoped to `contents: read`.

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

## Run in the browser (development)

```bash
npm run dev          # rebuilds the data, then starts Vite with hot reload
```

Open the `localhost` address it prints. To check the phone layout, use the
browser's device toolbar (Chrome/Edge DevTools → Ctrl+Shift+M) and pick a
narrow device such as 360 px wide. `npm run typecheck` runs the TypeScript
check on its own.

---

## App icon

The real icon — a flat chaise‑longue (the classic psychoanalyst's couch) on the
app's warm accent gradient — is generated by [`scripts/make_icon.py`](scripts/make_icon.py)
(pure Python, no dependencies) into:

- `resources/icon.png` — flattened master (used for the Tauri/Windows icon set,
  and as the iOS icon source)
- `resources/icon-background.png` / `resources/icon-foreground.png` — Android
  adaptive-icon layers (also used for iOS's icon set via `npm run ios:icon`)

Regenerate after tweaking the design:

```bash
python scripts/make_icon.py
```

To replace it with your own artwork instead, drop a square PNG (≥1024×1024) at
`resources/icon.png` (+ optional `icon-foreground.png`/`icon-background.png` for
a proper Android adaptive icon), then re-run `npx @tauri-apps/cli icon resources/icon.png`
for Windows and `npm run android:icon` for Android.

---

## Windows (Tauri)

```bash
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
npm run android:icon         # writes the launcher icon from resources/icon*.png

# after any change to src/, data/, or i18n/
npm run build && npm run android:sync

# open in Android Studio to run on a device/emulator or build an AAB
npm run android:open
```

`CapacitorHttp` is enabled in `capacitor.config.json`, which routes `fetch` through
native code and bypasses CORS. Internet permission is included by Capacitor by default.

To produce a release AAB for Play Store: Android Studio → Build → Generate Signed
Bundle, or `cd android && ./gradlew bundleRelease`.

### First-time Android SDK setup (no Android Studio)

If you don't have Android Studio, the command-line tools are enough to build
and run a debug/release APK:

```bash
# 1. Install the SDK command-line tools (example: scoop on Windows)
scoop install android-clt

# 2. Point env vars at it (persist with setx on Windows, export in ~/.bashrc elsewhere)
export ANDROID_HOME="<path-to-android-clt>"

# 3. Accept licenses, then install what's needed
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" \
  "emulator" "system-images;android-34;google_apis;x86_64"

# 4. (optional) create an emulator to test on
avdmanager create avd -n consulting_room \
  -k "system-images;android-34;google_apis;x86_64" -d pixel_5
emulator -avd consulting_room
```

Then `npm install`, `npm run android:add`, `npm run android:sync`, and build
with Gradle directly rather than `npm run android:run` (Capacitor's `cap run`
shells out to `gradlew` in a way that doesn't resolve reliably from Git Bash
on Windows):

```bash
cd android
./gradlew.bat assembleDebug      # -> android/app/build/outputs/apk/debug/app-debug.apk
./gradlew.bat assembleRelease    # -> .../apk/release/app-release-unsigned.apk
```

**The release APK above is unsigned and will not install as-is.** For local
testing (not a Play Store release, which needs a real, permanently-kept
release keystore) you can sign it with a throwaway debug-style key:

```bash
keytool -genkeypair -v -keystore android/app/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Debug,OU=Debug,O=Debug,L=Debug,S=Debug,C=US"

BT="$ANDROID_HOME/build-tools/34.0.0"
"$BT/zipalign" -f -p 4 app-release-unsigned.apk app-release-aligned.apk
"$BT/apksigner" sign --ks android/app/debug.keystore \
  --ks-pass pass:android --key-pass pass:android \
  --out app-release-signed.apk app-release-aligned.apk
```

`android/app/debug.keystore` is gitignored (a signing key is a secret and
never belongs in source control) — back it up yourself if you want future
rebuilds on another machine to be treated as updates to the same app instead
of a different signing identity.

---

## iPhone (Capacitor + Xcode)

Building for iOS requires a Mac (Xcode) — there's no way around that, Apple
doesn't allow iOS builds from Windows/Linux. Two ways to get one:

**A — free cloud Mac via CI (already set up):** the `ios` job in
[`.github/workflows/build.yml`](.github/workflows/build.yml) runs on a
GitHub-hosted macOS runner, adds the Capacitor iOS project, and builds an
**unsigned iOS Simulator build** — no Apple account needed for this. It proves
the app compiles and runs, but a Simulator build only runs in Xcode's
Simulator, not on a physical iPhone.

**B — your own Mac,** if you have one:
```bash
npm run ios:add     # creates the ios/ project (needs CocoaPods: sudo gem install cocoapods)
npm run ios:icon     # writes the app icon from resources/icon*.png
npm run build        # after any change to src/, data/, or i18n/
npm run ios:sync
npx cap open ios     # opens Xcode
```

**To install on a real iPhone or publish to the App Store**, beyond either of
the above, you need an **Apple Developer Program** account (**$99/year**),
which gets you:
- A signing certificate + provisioning profile (Xcode → Signing & Capabilities →
  pick your team, it handles the rest for a development build)
- **TestFlight** for beta-testing on real devices without full App Store review
- Eventually, submission for **App Store review** — expect to need a privacy
  policy URL (the app stores API keys and chat history in local `UserDefaults`/
  `localStorage` only, sent to whichever AI provider you configure — worth
  saying so explicitly) and an age rating; the "educational simulation, not a
  real clinician" framing already in the app's disclaimer should satisfy
  Apple's review guidelines around health/wellness-adjacent content, but
  Apple's reviewers have the final say.

---

## Languages & content

The app's text (UI, and each school-of-thought's conversational template bank)
lives in `data/core.json` (shared, language-independent: persona list, lineage
chains, category order) plus one file per language in `i18n/*.json`. **Do not
hand-edit `src/data/appData.generated.json`** — it's generated. After changing
anything under `data/` or `i18n/`, run:

```bash
npm run data:build
```

(`npm run dev` and `npm run build` already run this for you first.)

Currently shipped: English, Ukrainian, Spanish, Polish, German, Italian,
Catalan, French, Portuguese, Romanian, Russian. Every lookup
(`t()`, `modeData()`, `categories()`) falls back to English key-by-key, so a
language file can be partial without breaking anything — useful when adding
one incrementally. Two things are **not yet translated per-language** and
silently fall back to English: the 102 individual persona tag/terms/voice
blurbs, and the Live-AI-mode Settings panel labels (added after the original
i18n pass). `categories.crisis.kw` is the one field worth extra care in any
new language — it's what routes a message to the crisis-resources reply
instead of the scripted persona engine.

To add a language: copy `i18n/en.json` to `i18n/<code>.json`, translate
`label`/`ui`/`categories`/`modes` (and ideally `chainANotes`/`chainBNotes`),
add `<code>` to the `ORDER` array in `scripts/build-data.js`, then
`npm run data:build`.

## Psychology terms

The **Psychology terms** window explains nine terms whose meaning varies between schools, authors
and translators: *Besetzung* (cathexis), *das Ich / Es / Über-Ich* (ego, id, super-ego), *Trieb*
(instinct or drive), *Einfühlung* (empathy), *Nachträglichkeit* (deferred action), *Gemeinschaftsgefühl*
(social interest), *Selbstverwirklichung* (self-actualization), *phantasy* and *fantasy*, and Vygotsky's
*zona blizhaishego razvitiya* (zone of proximal development). Each has its original-language form, a short
gloss, the English renderings **with who uses which**, and where the meaning varies. The glosses are
simplified for study.

- Facts (terms, renderings, who uses them, sources) live in `data/terms.json`; per-language text (names,
  short glosses, "where it varies") in each `i18n/<code>.json` under `terms`. English and Ukrainian are
  complete; other languages show the English content with their own translated labels. The renderings
  and the names in "who uses which" stay in English.
- Every attribution comes from a source that was read: Wikipedia articles for the renderings and
  attributions quoted there, Jean Laplanche's entry on deferred action (*International Dictionary of
  Psychoanalysis*), Tim Dowling's paper on the zone of proximal development, and one mailing-list post
  (David Kellogg, 2016) for the French and "next" renderings. The window lists them as plain citations and
  has no links.

## Quotes

The **Quotes** window has one short passage each from five psychologists: William James, Sigmund Freud
(A. A. Brill's translation), Edward Thorndike, Wilhelm Wundt (Creighton and Titchener's translation) and
Alfred Adler (W. Béran Wolfe's translation). Each names its work, year, translator and source, and is shown
in the English text cited, never re-translated.

- **Rule: public domain everywhere.** A text qualifies only if its author **and its translator** died more
  than 70 years ago, so it is free to use in the US and in life+70 countries such as the EU, Ukraine and Poland.
  `src/lib/quotes.test.ts` enforces this (an unknown translator fails the test until someone checks them).
  That rules out Jung, Watson, Pavlov, Maslow and every later author: the window says no quotation is included
  for the other characters.
- Texts live in `data/quotes.json` (with `sourceUrls`, which are never shown in the app). They were copied
  from the source texts by a script, not typed. `node scripts/verify-quotes.js` (needs network; not run in CI)
  re-fetches every source and confirms each quotation appears there word for word. Adler and Wundt come from
  scans, so each is checked against **two or three independent scans** and would be dropped if they disagreed.
- Project Gutenberg texts are public domain in the US; the Gutenberg name is used only to cite the source.
- To add a quotation: find a short passage in a text whose author and translator both died before 1956,
  add its entry (and the translator's death year in `quotes.test.ts`), and run the verify script.

## Project layout

```
consulting-room-app/
├─ index.html                # Vite entry template (references src/main.tsx)
├─ src/
│  ├─ main.tsx, App.tsx      # app bootstrap + top-level view/modal wiring
│  ├─ state/                 # AppStateContext.tsx — settings, chat state, persistence
│  ├─ lib/                   # i18n, theming, persona helpers, scripted engine, liveAi.ts
│  ├─ components/            # Library, Chat, Settings, Modals
│  ├─ styles/global.css      # design tokens + component styles
│  └─ data/appData.generated.json   # generated — do not hand-edit (see above)
├─ data/core.json            # personas, lineage chains, category order (shared)
├─ data/terms.json           # psychology terms: renderings, who uses which, sources
├─ data/quotes.json          # public-domain quotations (with verification sources)
├─ i18n/*.json                # one file per language
├─ scripts/build-data.js     # data/ + i18n/ -> src/data/appData.generated.json
├─ scripts/verify-quotes.js  # re-fetches the quotation sources and checks them word for word
├─ www/                      # generated build output (gitignored) — Capacitor/Tauri serve this
├─ vite.config.ts            # build.outDir = "www"
├─ capacitor.config.json     # Android config (webDir: "www")
├─ package.json              # build scripts
└─ src-tauri/                # Windows (Tauri 2)
   ├─ tauri.conf.json        # frontendDist: "../www"
   ├─ Cargo.toml
   ├─ capabilities/default.json   # allow-list of API hosts
   └─ src/{main,lib}.rs
```

## Build outputs are not committed

`node_modules/`, `android/`, `ios/`, `src-tauri/target/`, `www/`, and
`ci-artifacts/` are all gitignored on purpose — they're generated from source
(`package.json`, `src/`, `data/`+`i18n/`), not hand-written, and binaries don't
belong in git history. A fresh clone gets them back via `npm install` +
`npm run build` + `npm run android:add` + a rebuild, **except** the signing
keystore (see above), which isn't
regenerable — the same key must be reused for every release build to update
an already-installed app. `ci-artifacts/` in particular is just a local
staging folder for build outputs you want to keep handy; if you want built
APKs/EXEs available online without bloating the repo, attach them to a
GitHub/GitLab Release instead.

## Updating the app

Edit `src/` (logic/markup/styles) and/or `data/core.json` + `i18n/*.json`
(content), run `npm run build` (regenerates data and rebuilds into `www/`),
then `npm run android:sync` and/or `npm run win:build`.
