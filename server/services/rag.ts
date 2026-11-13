import { supabase } from './supabase';
import { KnowledgeDocument } from '../types';

const FALLBACK_KNOWLEDGE: KnowledgeDocument[] = [
  {
    content: 'CPU and Motherboard socket compatibility: Intel 14th/13th/12th Gen CPUs require LGA 1700 motherboards (e.g., Z790, B760). AMD Ryzen 7000/9000 CPUs require AM5 motherboards (e.g., X670E, B650) with DDR5 RAM.',
    metadata: { source: 'fallback-compatibility' }
  },
  {
    content: 'Memory and Storage compatibility: Ensure RAM generation (DDR4 vs DDR5) matches motherboard specifications. NVMe M.2 Gen4/Gen5 SSDs fit standard M.2 slots on modern motherboards.',
    metadata: { source: 'fallback-compatibility' }
  },
  {
    content: 'Power Supply and Cabinet sizing: High-end GPUs (RTX 4080 Super / RTX 4090 / RX 7900 XTX) should pair with 850W to 1000W+ 80+ Gold/Platinum PSUs and Mid-Tower ATX cases.',
    metadata: { source: 'fallback-compatibility' }
  }
];

export async function searchKnowledge(query: string): Promise<KnowledgeDocument[]> {
  try {
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

    if (error || !data) {
      console.warn('Supabase searchKnowledge failed, using fallback knowledge:', error?.message);
      return FALLBACK_KNOWLEDGE;
    }

    return data.length > 0 ? (data as KnowledgeDocument[]) : FALLBACK_KNOWLEDGE;
  } catch (err: any) {
    console.warn('Supabase searchKnowledge error, using fallback knowledge:', err?.message || err);
    return FALLBACK_KNOWLEDGE;
  }
}
