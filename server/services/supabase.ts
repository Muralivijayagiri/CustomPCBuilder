import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { ComponentRecord } from '../types';

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

export async function fetchComponents(budget: number, category: string): Promise<ComponentRecord[]> {
  let query = supabase
    .from('components')
    .select('id, name, category, brand, price, specs, buy_link')
    .lte('price', budget);

  if (category !== 'ALL') {
    query = query.eq('category', category);
  }

  const { data, error } = await query
    .order('category', { ascending: true })
    .order('price', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch components: ${error.message}`);
  }

  return data as ComponentRecord[];
}

export async function fetchAllCategories(budget: number): Promise<ComponentRecord[]> {
  return fetchComponents(budget, 'ALL');
}

export async function fetchAllComponents(): Promise<ComponentRecord[]> {
  const { data, error } = await supabase
    .from('components')
    .select('id, name, category, brand, price, specs, buy_link, image_url, source')
    .order('category', { ascending: true })
    .order('price', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch all components: ${error.message}`);
  }

  return data as ComponentRecord[];
}

export async function upsertComponent(component: any): Promise<void> {
  const { error } = await supabase
    .from('components')
    .upsert({
      name: component.name,
      category: component.category,
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
