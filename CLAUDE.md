\# Project Context



> Claude Code reads this file automatically at the start of every session.

> Keep it short — every line here is loaded into context on every run.



\## Stack

TypeScript + React, built with Vite. Wrapped natively for Android (Capacitor) and Windows (Tauri 2). No backend/DB — all state in localStorage.



\## Project Structure

\- `src/` — app source (React components, `state/AppStateContext.tsx`, `lib/` helpers incl. `liveAi.ts`)

\- `data/core.json`, `data/terms.json`, `data/quotes.json` + `i18n/*.json` — content source; `scripts/build-data.js` compiles them into `src/data/appData.generated.json`

\- `www/` — generated build output (gitignored); Capacitor/Tauri serve this, never edit directly

\- `capacitor.config.json` / `src-tauri/tauri.conf.json` — native wrapper config



\## Current Status

\- \[x] Live AI hardened: crisis messages (wording from all 11 languages) never reach a provider (`src/lib/liveGate.ts`); prompt names the interface language for all 11; grammar pass for assembled replies (`src/lib/grammar.ts`)

\- \[x] Psychology terms window (`data/terms.json`, nine terms, attributed renderings, en + uk) and public-domain Quotes window (`data/quotes.json`, five quotations, `scripts/verify-quotes.js`)

\- \[x] `SECURITY.md` uses GitHub private vulnerability reporting

\- \[ ] No licence chosen yet (owner's decision)

\- \[ ] Android / Windows builds are CI-only; never run on a device



\## Rules for Claude Code

\- Do NOT scan the entire repository on startup.

\- Only read files explicitly named in the user's message.

\- Before reading more than 3 files, ask for confirmation.

\- Use `git log --oneline -10` — never full `git log`.

\- Use `git diff <file>` on specific files — never a full repo diff.

\- Use `git status --short` — never verbose status.

\- Do not enter autonomous/auto-run loops without explicit permission.

\- Prefer Plan Mode for multi-step tasks: propose the plan first, wait for approval, then execute.

\- After finishing a task, summarize changes in 3-5 lines — do not re-read files to confirm unless asked.



\## Commit Convention

Conventional Commits — `feat:`, `fix:`, `chore:`, `test:`, `ci:`, `docs:`.



\## Out of Scope

`node_modules/`, `www/` and `src/data/appData.generated.json` (generated); never commit signing keystores or API keys.

