import { describe, expect, it } from 'vitest';
import { BuildState, PCComponent } from '../shared/types';
import { checkCompatibility } from '../src/utils/compatibility';

function component(partial: Partial<PCComponent> & Pick<PCComponent, 'type' | 'brand' | 'name'>): PCComponent {
  return {
    id: 1,
    specs: '',
    displaySpecs: [],
    price: 0,
    ...partial,
  };
}

function build(partial: Partial<BuildState> = {}): BuildState {
  return {
    CABINET: null,
    MOTHERBOARD: null,
    CPU: null,
    GPU: null,
    SSD: null,
    PSU: null,
    RAM: [null, null, null, null],
    ...partial,
  };
}

describe('checkCompatibility', () => {
  it('flags an Intel CPU with the EVM H16 motherboard', () => {
    const issues = checkCompatibility(build({
      CPU: component({ type: 'CPU', brand: 'Intel', name: 'Core i5-14600K' }),
      MOTHERBOARD: component({ type: 'MOTHERBOARD', brand: 'EVM', name: 'EVM H16 Micro-ATX' }),
    }));

    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe('error');
  });

  it('does not flag non-Intel builds', () => {
    const issues = checkCompatibility(build({
      CPU: component({ type: 'CPU', brand: 'AMD', name: 'Ryzen 5 7600X' }),
      MOTHERBOARD: component({ type: 'MOTHERBOARD', brand: 'MSI', name: 'B650M' }),
    }));

    expect(issues).toEqual([]);
  });

  it('does nothing when either part is missing', () => {
    expect(checkCompatibility(build({
      CPU: component({ type: 'CPU', brand: 'Intel', name: 'Core i5-14600K' }),
    }))).toEqual([]);
  });
});
