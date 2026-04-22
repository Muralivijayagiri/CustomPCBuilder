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
