# Copilot / AI Agent Instructions

## Big Picture

**SARASSURE** is a **React 18 PWA** for senior digital literacy. Architecture:
- **Frontend:** React 18 + Vite (port `3000`, alias `@` → `src/`) with lazy-loaded pages
- **Backend:** Supabase (PostgreSQL + RLS, Auth, Storage)
- **Multi-role UI:** Learners, Trainers, Contributors, Admins with role-based routing (`src/pages/`)
- **Offline:** Service Worker cache v6 + manifest for full PWA capability
- **Styling:** Tailwind CSS + Shadcn/ui (Radix primitives)

## Essential Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Alias config, error handlers, dev server (port 3000) |
| `src/lib/supabaseClient.js` | Central Supabase client, image URL helpers, debug mode |
| `src/contexts/AuthContext.jsx` | Authentication + RPC calls (e.g., `get_profile_by_learner_code`) |
| `src/contexts/AdminContext.jsx` | Global admin state for moderation workflows |
| `src/App.jsx` | Route definitions; pages are lazy-loaded for performance |
| `public/sw.js` | Service Worker; PWA offline strategy and cache versioning |
| `migrations/` | SQL migrations run in order per `GUIDE_DEVELOPPEUR.md` |

## Quick Setup

```bash
npm install
# Copy .env.example → .env, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev    # Runs on http://localhost:3000
npm run build  # Bundles to dist/
```

## Architecture & Data Flow

### State Management
- **AuthContext:** JWT + user roles (`LEARNER`, `TRAINER`, `CONTRIBUTOR`, `ADMIN`). Exposes `loginWithLearnerCode()` → RPC call → user profile + license validation.
- **AdminContext:** Moderation state (exercise, image, questionnaire validation queues).
- **React Query:** Optional, used for server-side caching in some components.
- **Local storage:** PWA cache version, offline preferences.

### Routing
- Protected routes via `<ProtectedRoute role={USER_ROLES.LEARNER}>` wrapper.
- Role-based nav: `/task-list` (learner), `/trainer-dashboard` (trainer), `/contributor-dashboard` (contributor), `/admin` (admin).
- Lazy loading: critical pages (Layout, Home, Login) loaded eagerly; all others lazy-loaded.

### Database & RLS
- **Row-Level Security (RLS):** All tables enforce RLS policies. Queries fail silently if user lacks permission.
- **Key tables:** `profiles`, `exercises`, `questionnaires`, `images`, `licenses`, `glossary` (multi-language support).
- **RPC functions:** `get_profile_by_learner_code()`, revenue calculations, exercise request workflows.
## Project-Specific Patterns

### Import Alias
Always use `@` for imports: `import { supabase } from '@/lib/supabaseClient'`. Never relative imports (`../../../`).

### Image Handling
```javascript
import { getImageUrl } from '@/lib/supabaseClient';
const publicUrl = getImageUrl('path/to/image.jpg'); // Returns signed/public URL
```

### Retry & Backoff
```javascript
import { retryWithBackoff } from '@/lib/retryUtils';
const result = await retryWithBackoff(() => supabase.from('table').select(), 3, 1000);
```

### Caching (optional, used in some flows)
```javascript
import { cacheData, getCachedData } from '@/lib/retryUtils';
cacheData('key', data, 3600000); // 1hr TTL
const cached = getCachedData('key');
```

### Validation
Use helpers from `src/lib/validation.js`: `validateQuestion()`, `validateExerciseStep()`, `sanitizeHTML()`, etc.

### Performance Utilities
`src/lib/performance.js` exports `debounce()`, `throttle()`, `memoize()`, `lazyLoad()`, `preloadImage()`.

## Debugging & Fast Wins

- **Auth issues:** Check `loading` state handling in AuthContext (8s fallback timeout).
- **Supabase fallbacks:** `src/lib/supabaseClient.js` has safe defaults; local mode exposes `window.supabase` on `localhost`, `127.0.0.1`, `192.168.1.152`.
- **Error handling:** Vite error overlay posts messages to `window.parent` (inspect `vite.config.js`).
- **PWA offline:** Edit `public/sw.js` for cache strategy; update `manifest.json` version to bust cache.
- **RLS debugging:** Enable Supabase dashboard SQL editor to test policies directly.

## Integration Points

- **Supabase:** migrations are authoritative; run in order documented in `GUIDE_DEVELOPPEUR.md`.
- **Stripe:** `src/config/stripeConfig.js` + `@stripe/react-stripe-js` for payments.
- **Translation (i18n):** Glossary system in DB with multi-language support (added Dec 2025).
- **Custom icons:** `src/lib/customIconsService.js` and `IconSelector.jsx` for icon management.
- **Plugins (edit mode):** Under `plugins/` — currently disabled in production; re-enable carefully in `vite.config.js`.

## Code Review Checklist

- Remove all `console.log` statements.
- Run migrations in correct order if DB changes.
- Test user flows: auth, exercise completion, questionnaire, offline mode.
- Lint & format pass (Prettier/ESLint).
- RLS policies allow intended access; deny unintended.
- Commit messages follow Conventional Commits format.
