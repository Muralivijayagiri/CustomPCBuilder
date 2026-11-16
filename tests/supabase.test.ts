import { describe, expect, it } from 'vitest';
import { filterValidComponents } from '../server/services/supabase';
import { ComponentRecord } from '../shared/types';

function record(partial: Partial<ComponentRecord> & Pick<ComponentRecord, 'category' | 'brand' | 'price'>): ComponentRecord {
  return {
    id: '1',
    name: 'Test component',
    specs: {},
    buy_link: null,
    ...partial,
  };
}

describe('filterValidComponents', () => {
  it('drops implausible CPU listings', () => {
    const result = filterValidComponents([
      record({ category: 'CPU', brand: 'Generic', price: 9000 }),
      record({ category: 'CPU', brand: 'AMD', price: 9000 }),
      record({ category: 'CPU', brand: 'Intel', price: 1000 }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('AMD');
  });

  it('validates motherboard brands', () => {
    const result = filterValidComponents([
      record({ category: 'MOTHERBOARD', brand: 'Unknown', price: 9000 }),
      record({ category: 'MOTHERBOARD', brand: 'ASUS', price: 9000 }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('ASUS');
  });
});
