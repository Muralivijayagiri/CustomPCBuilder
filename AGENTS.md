# AGENTS.md

Single-package React 19 SPA + Express API. No monorepo or CI workflow; no test runner, ESLint, or Prettier config.

## Commands

- `npm ci` — `node_modules/` is not committed.
- `npm run dev` — UI + API on `http://localhost:3000` (`PORT` overrides). `server/index.ts` mounts Vite middleware, so use this instead of running Vite separately. `vite.config.ts` proxies `/api` to `:3001`, but the server listens on `:3000`; `BACKEND_PORT`/`config.port` are unused.
- `npm run lint` — only `tsc --noEmit`; checks `src/` + `server/` (root `test-*.ts` are excluded). Standard verification is `npm run lint && npm run build`; there is no test step.
- `npm run build` — Vite client build + esbuild bundle to `dist/server.cjs`.
- `npm start` does not set `NODE_ENV`. Set it (`$env:NODE_ENV='production'; npm start` in PowerShell) or the server boots Vite middleware instead of serving `dist/index.html`. `dist/server.cjs` also top-level-imports `vite`, so production installs cannot omit devDependencies.
- `npm run clean` is `rm -rf dist`; it fails in Windows `cmd` — use `Remove-Item -Recurse -Force dist`.
- No `npm test`. Root `test-*.ts` are manual probes (`npx tsx test-db.ts`); `test-refresh.ts` expects the API on `:3001`.

## Architecture

- Entrypoints: `index.html` → `src/main.tsx` → `src/App.tsx`; API starts at `server/index.ts`, routers in `server/routes/` mounted under `/api` (`GET /api/health`, `GET /api/components`, `POST /api/chat`, `POST /api/refresh`).
- `/api/chat` is two-stage Gemini: `checkContext` requires budget + use case + OS; until all three exist it returns a plain-text question. Only then does `streamRecommendation` stream chunked `text/plain` (not SSE). A single test message usually gets the question, not a build.
- Supabase failures degrade gracefully: the server falls back to `src/data.ts` components and hard-coded knowledge, and the UI uses the same local catalog if `/api/components` fails. The server imports `src/data.ts` and `src/utils/specMapper.ts`; keep DOM/browser-only code out of those modules.
- API vs UI shapes differ: `server/types.ts` `ComponentRecord` vs `src/types.ts` `PCComponent`; `src/services/api.ts` does the transform and uppercases `category`.
- AI provider is hard-coded to `'gemini'` in `server/config/env.ts`; HuggingFace branches are unreachable without editing it. Code reads `HF_TOKEN` (error text says `HUGGINGFACEHUB_API_TOKEN`). `AI_PROVIDER` and `APP_URL` in `.env.example` are never read.
- `/api/refresh` category casing is mixed: `Motherboard`/`Cabinet` are title case, the other five uppercase. `server/services/serp/{queries,categories}.ts` depend on it; don't normalize blindly.
- Tailwind v4 is configured in `src/index.css` (`@theme`, `@tailwindcss/typography`); there is no `tailwind.config.*`. The `@/*` alias resolves to the repo root, not `src/`.

## Environment / data gotchas

- `.env` is gitignored; `.env.example` is incomplete. The server reads `GEMINI_API_KEY` (needed for chat), `HF_TOKEN`, `SERP_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PORT` (listen), and `BACKEND_PORT` (unused); Supabase URL/anon key have hard-coded fallbacks.
- Without `SERP_API_KEY`, or on SerpAPI errors/rate limits, `POST /api/refresh` falls back to Gemini-generated listings and upserts them into Supabase without surfacing an error — don't call it against a real database casually.
- No SQL migrations/schema are in-repo. Supabase tables: `components` and `documents` (`documents.content` is full-text searched). Prices are INR/₹ and refresh targets Amazon India.
