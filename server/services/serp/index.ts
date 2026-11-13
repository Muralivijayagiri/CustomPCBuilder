import { getKeywordsForCategory } from './queries';
import { searchProducts, getProductDetail, delay } from './fetcher';
import { classifyCategory } from './categories';
import { parseSearchResult, parseProductDetail } from './parser';
import { upsertComponents } from '../supabase';

export async function refreshCategory(category: string) {
  const keywords = getKeywordsForCategory(category);
  if (keywords.length === 0) {
    return { category, total: 0, inserted: 0, failed: 0 };
  }

  const allComponents: any[] = [];

  for (const keyword of keywords) {
    let searchResults;
    try {
      searchResults = await searchProducts(keyword);
    } catch (e) {
      console.error(`Skipping keyword ${keyword} due to error`, e);
      continue;
    }
    
    for (const result of searchResults) {
      const parsedSearch = parseSearchResult(result, category);
      if (!parsedSearch) continue;

      const classifiedCat = classifyCategory(parsedSearch.name, keyword);
      if (classifiedCat === 'Unknown') continue;

      parsedSearch.category = classifiedCat; // Assign the correctly classified one
      allComponents.push(parsedSearch);
    }
    
    await delay(500);
  }

  const summary = await upsertComponents(allComponents);
  return {
    category,
    total: allComponents.length,
    inserted: summary.inserted,
    failed: summary.failed
  };
}
