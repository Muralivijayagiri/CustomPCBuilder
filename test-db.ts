import { supabase } from './server/services/supabase';

async function checkDb() {
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
