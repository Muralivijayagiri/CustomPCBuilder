import type { ComponentCategory } from './types';

export const COMPONENT_CATEGORIES: readonly ComponentCategory[] = [
  'CPU',
  'GPU',
  'RAM',
  'SSD',
  'PSU',
  'MOTHERBOARD',
  'CABINET',
];

const CATEGORY_SET = new Set<string>(COMPONENT_CATEGORIES);

export function normalizeCategory(value: unknown): ComponentCategory | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return CATEGORY_SET.has(normalized) ? (normalized as ComponentCategory) : null;
}

export function isComponentCategory(value: unknown): value is ComponentCategory {
  return normalizeCategory(value) !== null;
}

/**
 * Existing Supabase rows may still store two categories in title case.
 * Query both spellings until the normalization migration has been applied.
 */
export function categoryQueryValues(category: ComponentCategory): string[] {
  if (category === 'MOTHERBOARD') return [category, 'Motherboard'];
  if (category === 'CABINET') return [category, 'Cabinet'];
  return [category];
}
