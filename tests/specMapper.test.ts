import { describe, expect, it } from 'vitest';
import { getShortName } from '../src/utils/specMapper';

describe('getShortName', () => {
  it('removes Amazon storefront prefixes and marketing suffixes', () => {
    expect(getShortName('Visit the NVIDIA Store - RTX 4090 | 24GB GDDR6X')).toBe('RTX 4090');
  });

  it('truncates long names', () => {
    const result = getShortName('Very Long Component Name That Should Be Truncated', 15);
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(18);
  });
});
