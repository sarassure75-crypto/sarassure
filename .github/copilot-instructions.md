# Copilot / AI Agent Instructions

Purpose: Quickly onboard an AI coding agent to be productive in this repository.

- **Big picture**: This is a React 18 SPA built with Vite in `src/`, backed by Supabase (Postgres, Auth, Storage) and deployed as a PWA. UI components live in `src/components/` and pages under `src/pages/`. Build and tooling are configured in `vite.config.js` (alias `@` => `src/`).

- **Key files to read first**:
  - `GUIDE_DEVELOPPEUR.md` — canonical developer guide and runbooks for DB migrations and environment setup.
  - `README.md` — project overview, commands, and conventions.
  - `vite.config.js` — aliasing (`@`) and dev server port (`3001`) plus custom plugin points.
  - `src/lib/supabaseClient.js` — central Supabase client, storage `images` bucket usage, and local debug helpers (exposes `window.supabase` on known local hosts).
  - `src/contexts/AuthContext.jsx` — authentication flows, `loginWithLearnerCode` RPC usage (`get_profile_by_learner_code`) and `retryWithBackoff` pattern.
  - `public/sw.js` and `public/manifest.json` — PWA and cache/versioning details (cache v6 present in repo).
  - `migrations/` and `schema.sql` — SQL migrations; run in order as documented in `GUIDE_DEVELOPPEUR.md`.

- **Dev workflow (concrete commands)**
  - Install: `npm install`
  - Dev server: `npm run dev` (Vite server, default configured to port `3001`)
  - Build: `npm run build`
  - .env: copy `.env.example` → `.env` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optionally `VITE_STRIPE_PUBLIC_KEY`.

- **Project-specific conventions & patterns**
  - Absolute imports use the `@` alias (e.g., `import { supabase } from '@/lib/supabaseClient'`). See `vite.config.js` resolve.alias.
  - Supabase client exposes safe fallback values in `src/lib/supabaseClient.js`. Local debug behavior attaches the client to `window.supabase` on `localhost`, `127.0.0.1`, and `192.168.1.152`.
  - Image URLs are obtained via `supabase.storage.from('images').getPublicUrl(filePath)`; helper `getImageUrl()` is defined in `src/lib/supabaseClient.js`.
  - Authentication often uses Supabase RPCs (see `loginWithLearnerCode` → RPC `get_profile_by_learner_code`) — changing these RPC names requires DB migration updates.
  - Retry/backoff helper pattern: use `retryWithBackoff` from `src/lib/retryUtils` when calling external or flaky APIs (used in `AuthContext`).
  - Custom Vite plugins live under `plugins/visual-editor/` and `plugins/`. They are intentionally commented out for production in `vite.config.js` — be cautious when re-enabling.

- **Debugging tips (fast wins for agents)**
  - Check `src/lib/supabaseClient.js` for public key fallbacks and `console` logs left for debugging (these exist intentionally).
  - Dev server injects runtime/error handlers via `vite.config.js` (search for 'addTransformIndexHtml') — errors may be intercepted or posted to `window.parent`.
  - For auth/state issues, inspect `src/contexts/AuthContext.jsx` and watch how `loading` is handled (fallback timeout of 8s).
  - For PWA issues, inspect `public/sw.js` and manifest version fields.

- **Integration points & external dependencies**
  - Supabase: database, auth, and storage. SQL migrations are authoritative (see `migrations/` and `schema.sql`).
  - Stripe: `config/stripeConfig.js` contains Stripe integration points and public key usage.
  - Plugins: visual editor and iframe route restoration under `plugins/` — these are extension points for editing features.

- **PR / code review conventions** (concrete checks)
  - Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, ...).
  - Remove `console.log` before PR; no leftover debug prints.
  - Ensure formatting/linting (Prettier/ESLint) passes locally.
  - Manual checks: test main user flows (auth, questionnaire, upload images, offline PWA install) after changes that affect those areas.

- **Examples to reference when making changes**
  - Add image upload handling: inspect `src/components/ImageFromSupabase.jsx` and `src/lib/supabaseClient.js`.
  - Auth-related change: inspect `src/contexts/AuthContext.jsx` and `src/pages/RegisterPage.jsx` / `src/pages/RegisterPage.jsx` for usage patterns.
  - DB migration change: add SQL to `migrations/` and update `REFERENCE_ACTUELLE_SYSTEME.md` + `GUIDE_DEVELOPPEUR.md` run order.

If anything in the above feels incomplete or you want more examples (e.g., common PR templates, CI commands, or test commands), tell me which area to expand.
