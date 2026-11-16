# Manual probes

These are ad-hoc scripts, not part of the automated test suite. Run one with:

```bash
npx tsx scripts/manual/probe-db.ts
```

- `probe-db.ts` — prints PSU/Cabinet rows from Supabase.
- `probe-refresh.ts` — calls `POST /api/refresh`; starts with an invalid category and then RAM. **The RAM call can write AI-generated rows when `SERP_API_KEY` is unset.**
- `probe-serp.ts` — prints raw SerpAPI search results.
- `probe-hf*.ts` — direct Hugging Face inference checks.
- `probe-net.ts` — basic outbound network check.

Set `API_URL` to point `probe-refresh.ts` at a non-default server (default `http://localhost:3000`).
