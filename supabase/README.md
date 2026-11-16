# Supabase

The app expects two tables:

- `components` — catalog rows (`name`, `category`, `brand`, `price`, `specs`, `buy_link`, `image_url`, `source`).
- `documents` — knowledge chunks (`content`, `metadata`).

Schema changes are kept in `migrations/`. Apply them with the Supabase CLI (`supabase db push`) or by running the SQL in the Supabase SQL editor. The app also tolerates legacy title-case `Motherboard`/`Cabinet` values until the normalization migration is applied.
