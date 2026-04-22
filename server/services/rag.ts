import { supabase } from './supabase';
import { KnowledgeDocument } from '../types';

export async function searchKnowledge(query: string): Promise<KnowledgeDocument[]> {
  // Uses Supabase's built-in textSearch which maps directly to the required Postgres 
  // full text search: to_tsvector('english', content) @@ plainto_tsquery('english', query)
  const { data, error } = await supabase
    .from('documents')
    .select('content, metadata')
    .textSearch('content', query, {
      type: 'plain',
      config: 'english'
    })
    .limit(5);

  if (error) {
    throw new Error(`Failed to search knowledge base: ${error.message}`);
  }

  return (data || []) as KnowledgeDocument[];
}
