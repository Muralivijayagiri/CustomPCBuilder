import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { ComponentCategory, ComponentRecord } from '../../shared/types';
import { categoryQueryValues, normalizeCategory } from '../../shared/categories';
import { componentsData } from '../../shared/data';

export const supabase: SupabaseClient | null =
  config.supabaseUrl && config.supabaseAnonKey
    ? createClient(config.supabaseUrl, config.supabaseAnonKey)
    : null;

function getFallbackComponents(budget?: number, category: ComponentCategory | 'ALL' = 'ALL'): ComponentRecord[] {
  let items: ComponentRecord[] = componentsData.map((c) => ({
    id: String(c.id),
    name: c.name,
    category: c.type,
    brand: c.brand,
    price: c.price,
    specs: c.specs ? { summary: c.specs } : {},
    buy_link: c.buy_link ?? null,
    image_url: c.image_url,
    source: 'local-catalog',
  }));

  if (typeof budget === 'number') {
    items = items.filter((item) => item.price <= budget);
  }
  if (category !== 'ALL') {
    items = items.filter((item) => item.category === category);
  }

  return items.sort((a, b) => {
    const catCmp = a.category.localeCompare(b.category);
    return catCmp !== 0 ? catCmp : a.price - b.price;
  });
}

function normalizeComponents(data: any[]): ComponentRecord[] {
  return data.flatMap((comp): ComponentRecord[] => {
    const category = normalizeCategory(comp.category);
    if (!category) {
      console.warn(`Skipping component ${comp.name || comp.id} with unknown category:`, comp.category);
      return [];
    }
    return [{ ...comp, category }];
  });
}

export function filterValidComponents(data: ComponentRecord[]): ComponentRecord[] {
  return data.filter(comp => {
    if (comp.category === 'CPU') {
      const b = (comp.brand || '').toLowerCase();
      const validBrand = b.includes('intel') || b.includes('amd') || b.includes('snapdragon');
      return validBrand && comp.price >= 5000;
    }
    if (comp.category === 'MOTHERBOARD') {
      const b = (comp.brand || '').toLowerCase();
      const validBrand = b.includes('asus') || b.includes('msi') || b.includes('gigabyte') || b.includes('asrock') || b.includes('nzxt') || b.includes('colorful');
      return validBrand && comp.price >= 4000;
    }
    return true;
  });
}

export async function fetchComponents(budget: number, category: ComponentCategory | 'ALL'): Promise<ComponentRecord[]> {
  if (!supabase) {
    return filterValidComponents(getFallbackComponents(budget, category));
  }

  try {
    let query = supabase
      .from('components')
      .select('id, name, category, brand, price, specs, buy_link')
      .lte('price', budget);

    if (category !== 'ALL') {
      query = query.in('category', categoryQueryValues(category));
    }

    const { data, error } = await query
      .order('category', { ascending: true })
      .order('price', { ascending: true });

    if (error || !data) {
      console.warn('Supabase fetchComponents failed, using local fallback catalog:', error?.message);
      return filterValidComponents(getFallbackComponents(budget, category));
    }

    return filterValidComponents(normalizeComponents(data));
  } catch (err: any) {
    console.warn('Supabase fetchComponents error, using local fallback catalog:', err?.message || err);
    return filterValidComponents(getFallbackComponents(budget, category));
  }
}

export async function fetchAllCategories(budget: number): Promise<ComponentRecord[]> {
  const allComps = await fetchComponents(budget, 'ALL');
  
  // Group by category
  const grouped: Record<string, ComponentRecord[]> = {};
  for (const comp of allComps) {
    if (!grouped[comp.category]) grouped[comp.category] = [];
    grouped[comp.category].push(comp);
  }
  
  // Pick an evenly distributed spread of components across the price range
  const MAX_PER_CATEGORY = 25;
  const result: ComponentRecord[] = [];
  
  for (const cat in grouped) {
    const items = grouped[cat];
    if (items.length <= MAX_PER_CATEGORY) {
      result.push(...items);
    } else {
      const step = (items.length - 1) / (MAX_PER_CATEGORY - 1);
      for (let i = 0; i < MAX_PER_CATEGORY; i++) {
        result.push(items[Math.round(i * step)]);
      }
    }
  }
  
  return result;
}

export async function fetchAllComponents(): Promise<ComponentRecord[]> {
  if (!supabase) {
    return filterValidComponents(getFallbackComponents());
  }

  try {
    const { data, error } = await supabase
      .from('components')
      .select('id, name, category, brand, price, specs, buy_link, image_url, source')
      .order('category', { ascending: true })
      .order('price', { ascending: true });

    if (error || !data) {
      console.warn('Supabase fetchAllComponents failed, using local fallback catalog:', error?.message);
      return filterValidComponents(getFallbackComponents());
    }

    return filterValidComponents(normalizeComponents(data));
  } catch (err: any) {
    console.warn('Supabase fetchAllComponents error, using local fallback catalog:', err?.message || err);
    return filterValidComponents(getFallbackComponents());
  }
}

export async function upsertComponent(component: any): Promise<void> {
  const category = normalizeCategory(component.category);
  if (!category) {
    throw new Error(`Invalid component category: ${component.category}`);
  }
  if (!supabase) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY to refresh components.');
  }

  const { error } = await supabase
    .from('components')
    .upsert({
      name: component.name,
      category,
      brand: component.brand,
      price: component.price,
      specs: component.specs,
      buy_link: component.buy_link,
      image_url: component.image_url,
      source: component.source,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'buy_link'
    });

  if (error) {
    throw new Error(`Supabase upsert error: ${error.message}`);
  }
}

export async function upsertComponents(components: any[]): Promise<{ inserted: number, failed: number }> {
  let inserted = 0;
  let failed = 0;

  for (const comp of components) {
    try {
      await upsertComponent(comp);
      inserted++;
    } catch (err) {
      console.error('Failed to upsert component:', err);
      failed++;
    }
  }

  return { inserted, failed };
}
