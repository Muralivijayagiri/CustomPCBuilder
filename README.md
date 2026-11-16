# AI PC Builder

An AI-powered drag-and-drop custom PC building configurator built with React, TypeScript, Express, Supabase, and Google Gemini (Hugging Face optional).

## Features

- **Interactive Drag-and-Drop PC Configurator:** Drag and drop components (Cabinet, Motherboard, CPU, GPU, RAM, SSD, PSU) into a visual PC cabinet layout with slot-aware placement.
- **AI Build Assistant:** Streaming chat assistant powered by Google Gemini (`gemini-2.5-flash`) by default, configurable to Hugging Face. It gathers budget, use case, and OS preferences, then recommends compatible builds from live catalog inventory.
- **RAG Knowledge & Component Catalog:** Backed by Supabase PostgreSQL for component storage (`components`) and full-text knowledge retrieval (`documents`). Without Supabase the app uses a built-in local catalog.
- **Component Refresh Pipeline:** Optional SerpAPI integration to fetch and parse updated hardware pricing and specs from Amazon India.
- **Build Summary & Checkout View:** Real-time pricing breakdown and build review page.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend:** Node.js, Express, TypeScript (`tsx` / `esbuild`)
- **AI / LLM:** `@google/genai` (Gemini 2.5 Flash) or `@huggingface/inference`, selected with `AI_PROVIDER`
- **Database:** Supabase (`@supabase/supabase-js`), optional
- **Tests:** Vitest; **CI:** GitHub Actions

## Getting Started

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Copy `.env.example` to `.env` and fill in the values you need (see below).
3. Start the development server:
   ```bash
   npm run dev
   ```
   UI and API are served together on `http://localhost:3000` (`PORT` overrides). `vite.config.ts` proxies `/api` to the same port.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `AI_PROVIDER` | No | `gemini` (default) or `huggingface` |
| `GEMINI_API_KEY` | For Gemini | Chat plus the AI fallback used by `/api/refresh` |
| `HF_TOKEN` | For Hugging Face | Hugging Face inference |
| `SERP_API_KEY` | No | Real Amazon India refreshes; without it `/api/refresh` uses AI-generated listings |
| `SUPABASE_URL` | No | Enables the Supabase catalog/knowledge base |
| `SUPABASE_ANON_KEY` | No | Supabase anon key |
| `PORT` | No | Server port, default `3000` |

If Supabase is not configured, the app falls back to the bundled local catalog.

## Scripts

- `npm run dev` — dev server with Vite middleware.
- `npm run lint` — `tsc --noEmit`.
- `npm test` — Vitest (`npm run test:watch` for watch mode).
- `npm run build` — client build + `dist/server.cjs` bundle.
- `npm start` — production server; sets `NODE_ENV=production` and serves `dist/`.
- `npm run clean` — removes `dist/` (cross-platform).
- Manual probes live in `scripts/manual/`; see `scripts/manual/README.md`.

## Database

SQL migrations are in `supabase/migrations/`. Apply them with the Supabase CLI (`supabase db push`) or in the Supabase SQL editor. The normalization migration converts legacy title-case `Motherboard`/`Cabinet` rows to uppercase; the app keeps querying both spellings until it runs. See `supabase/README.md`.

## Production

```bash
npm run build
npm start
```

`npm start` sets `NODE_ENV=production`, so the server serves `dist/index.html` and does not mount Vite. In development the Vite import is lazy; no Vite code is loaded at runtime in production.

## Project Structure

```
src/            React UI, hooks, utils, API client
server/         Express routes, AI/Supabase/SerpAPI services
shared/         Shared types, category helpers, local catalog
tests/          Vitest unit tests
scripts/        start/clean helpers + manual probes
supabase/       SQL migrations and notes
.github/        CI workflow
```

## CI

`.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm test`, and `npm run build` on Node 22 for pushes and pull requests.
