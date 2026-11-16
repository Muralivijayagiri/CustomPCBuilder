# AGENTS.md

Single-package React 19 SPA + Express API. Shared types, category helpers, and the local catalog live in `shared/`. Vitest covers pure logic; GitHub Actions runs lint + tests + build. No ESLint or Prettier config.

## Commands

- `npm ci` — `node_modules/` is not committed.
- `npm run dev` — UI + API on `http://localhost:3000` (`PORT` overrides). `server/index.ts` mounts Vite middleware, so use this instead of running Vite separately. `vite.config.ts` proxies `/api` to `http://localhost:${PORT || 3000}`, matching the server.
- `npm run lint` — only `tsc --noEmit`; checks `src/`, `server/`, `shared/`, `tests/`, `scripts/`, and both Vite/Vitest configs.
- `npm test` — Vitest one-shot run (`npm run test:watch` for watch mode). Tests live in `tests/*.test.ts`.
- `npm run build` — Vite client build + esbuild bundle to `dist/server.cjs`.
- `npm start` — runs `scripts/start.cjs`, which sets `NODE_ENV=production` and loads `dist/server.cjs`. Build first; it serves `dist/index.html` and does not mount Vite.
- `npm run clean` — cross-platform `scripts/clean.mjs`; removes `dist/`.
- Standard verification: `npm run lint && npm test && npm run build`.
- Manual probes are in `scripts/manual/` (`npx tsx scripts/manual/probe-db.ts`), not part of `npm test`. See `scripts/manual/README.md`.

## Architecture

- Entrypoints: `index.html` → `src/main.tsx` → `src/App.tsx`; API starts at `server/index.ts`, routers in `server/routes/` mounted under `/api` (`GET /api/health`, `GET /api/components`, `POST /api/chat`, `POST /api/refresh`). The first two routes live in `server/routes/chat.ts`.
- `/api/chat` is two-stage: `checkContext` requires budget + use case + OS; until all three exist it returns a plain-text question. Only then does `streamRecommendation` stream chunked `text/plain` (not SSE). A single test message usually gets the question, not a build.
- AI provider is selected by `AI_PROVIDER`: `gemini` (default) or `huggingface`. Gemini uses `GEMINI_API_KEY`; Hugging Face uses `HF_TOKEN`. Provider logic is in `server/services/ai.ts`.
- Supabase failures degrade gracefully: the server falls back to the local catalog in `shared/data.ts` and hard-coded knowledge, and the UI uses the same catalog if `/api/components` fails. The server imports only `shared/`; keep DOM/browser-only code out of shared modules.
- `shared/types.ts` is the single source of truth for `ComponentRecord`, `PCComponent`, `BuildState`, chat/intent shapes. `src/types.ts` just re-exports it.
- Categories are canonical uppercase (`CPU`, `GPU`, `RAM`, `SSD`, `PSU`, `MOTHERBOARD`, `CABINET`). `shared/categories.ts` owns `normalizeCategory` and `categoryQueryValues`. The latter also queries legacy title-case `Motherboard`/`Cabinet` rows until the migration is applied.
- `/api/refresh` accepts any casing and normalizes it; SerpAPI classification and upserts write canonical uppercase.
- `src/components/Cabinet.tsx` composes extracted pieces from `src/components/cabinet/` (`TraceLine`, `GPUFan`, `FilledSlot`).
- Tailwind v4 is configured in `src/index.css` (`@theme`, `@tailwindcss/typography`); there is no `tailwind.config.*` or PostCSS config. The `@/*` alias resolves to the repo root, not `src/`.

## Environment / data gotchas

- `.env` is gitignored; `.env.example` documents every variable. The server reads:
  - `AI_PROVIDER` — `gemini` (default) or `huggingface`
  - `GEMINI_API_KEY` — required for Gemini chat and the `/api/refresh` AI fallback
  - `HF_TOKEN` — required for Hugging Face inference
  - `SERP_API_KEY` — optional; real Amazon India refreshes
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` — optional; without them the app uses the local catalog
  - `PORT` — listen port, default `3000`
- The Supabase client is `null` when URL/key are missing. There are no hard-coded credentials or fallbacks in source.
- Without `SERP_API_KEY`, or on SerpAPI errors/rate limits, `POST /api/refresh` falls back to AI-generated listings and upserts them into Supabase without surfacing an error — don't call it against a real database casually.
- Supabase schema changes live in `supabase/migrations/` (see `supabase/README.md`). Tables: `components` and `documents` (`documents.content` is full-text searched). Prices are INR/₹ and refresh targets Amazon India.
- CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, `npm test`, and `npm run build` on Node 22.
