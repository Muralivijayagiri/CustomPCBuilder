# AI PC Builder

An AI-powered drag-and-drop custom PC building configurator built with React, TypeScript, Express, Supabase, and Google Gemini.

## Features

- **Interactive Drag-and-Drop PC Configurator:** Drag and drop components (Cabinet, Motherboard, CPU, GPU, RAM, SSD, PSU) into a visual PC cabinet layout with slot-aware placement.
- **AI Build Assistant:** Streaming chat assistant powered by Google Gemini (`gemini-2.5-flash`) that gathers user budget, use case, and OS preferences, then recommends compatible builds from live catalog inventory.
- **RAG Knowledge & Component Catalog:** Backed by Supabase PostgreSQL for component storage (`components`) and full-text knowledge retrieval (`documents`).
- **Component Refresh Pipeline:** Optional SERP API integration to fetch and parse updated hardware pricing and specs.
- **Build Summary & Checkout View:** Real-time pricing breakdown and build review page.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend:** Node.js, Express, TypeScript (`tsx` / `esbuild`)
- **AI / LLM:** `@google/genai` (Gemini 2.5 Flash) with `@huggingface/inference` fallback support
- **Database:** Supabase (`@supabase/supabase-js`)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables based on `.env.example`.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```
