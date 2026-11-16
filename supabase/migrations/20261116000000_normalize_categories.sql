-- Normalize legacy category spellings to the canonical uppercase values used by the app.
update public.components
set category = upper(category)
where upper(category) in ('CPU', 'GPU', 'RAM', 'SSD', 'PSU', 'MOTHERBOARD', 'CABINET')
  and category <> upper(category);

-- Catalog queries filter by category and sort by price.
create index if not exists components_category_price_idx
  on public.components (category, price);

-- /api/chat uses documents.content full-text search.
create index if not exists documents_content_fts_idx
  on public.documents using gin (to_tsvector('english', content));
