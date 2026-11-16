import { supabase } from '../../server/services/supabase';

async function checkDb() {
  if (!supabase) {
    console.error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.');
    return;
  }

  const { data, error } = await supabase
    .from('components')
    .select('category, name, brand')
    .in('category', ['PSU', 'Cabinet']);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Results:', data);
  }
}

checkDb();
