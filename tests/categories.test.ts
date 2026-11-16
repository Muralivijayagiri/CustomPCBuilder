import { describe, expect, it } from 'vitest';
import { categoryQueryValues, normalizeCategory } from '../shared/categories';

describe('normalizeCategory', () => {
  it('accepts canonical uppercase categories', () => {
    expect(normalizeCategory('CPU')).toBe('CPU');
    expect(normalizeCategory('MOTHERBOARD')).toBe('MOTHERBOARD');
  });

  it('normalizes legacy title case and whitespace', () => {
    expect(normalizeCategory('Motherboard')).toBe('MOTHERBOARD');
    expect(normalizeCategory(' Cabinet ')).toBe('CABINET');
  });

  it('rejects unknown categories', () => {
    expect(normalizeCategory('MONITOR')).toBeNull();
    expect(normalizeCategory(undefined)).toBeNull();
  });
});

describe('categoryQueryValues', () => {
  it('includes the legacy title-case spelling for migrated tables', () => {
    expect(categoryQueryValues('MOTHERBOARD')).toEqual(['MOTHERBOARD', 'Motherboard']);
    expect(categoryQueryValues('CABINET')).toEqual(['CABINET', 'Cabinet']);
    expect(categoryQueryValues('CPU')).toEqual(['CPU']);
  });
});
