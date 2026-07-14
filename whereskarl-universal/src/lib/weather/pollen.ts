/**
 * Canonical Pollen presentation for universal product surfaces.
 * Mirrors whereskarl-web/lib/weather/pollen.ts — category / colorToken are
 * owned by the backend; this module only maps colorToken → platform color.
 *
 * Phone Selected Location is the first shipping UI consumer. Desktop/tablet
 * Selected Location intentionally defer pollen (product decision, matching UV).
 * Additional Map, Home, Favorites, Notifications, and Environmental Health
 * surfaces should reuse these helpers without a second pollen model.
 */

import type { Pollen, PollenCategory } from '@/types/weather';

export type { Pollen, PollenCategory };

export type PollenColorToken =
  | 'pollen.none'
  | 'pollen.very-low'
  | 'pollen.low'
  | 'pollen.moderate'
  | 'pollen.high'
  | 'pollen.very-high'
  | 'pollen.unavailable';

export const POLLEN_COLOR_BY_TOKEN: Record<PollenColorToken, string | null> = {
  'pollen.none': '#22E36B',
  'pollen.very-low': '#84CC16',
  'pollen.low': '#F5A623',
  'pollen.moderate': '#F97316',
  'pollen.high': '#FF5A5F',
  'pollen.very-high': '#A855F7',
  'pollen.unavailable': null,
};

export type PollenPresentation = {
  available: boolean;
  value: number | null;
  category: PollenCategory | null;
  colorToken: PollenColorToken;
  color: string | null;
  label: string;
  description: string | null;
};

const UNAVAILABLE_POLLEN: PollenPresentation = {
  available: false,
  value: null,
  category: null,
  colorToken: 'pollen.unavailable',
  color: null,
  label: 'Unavailable',
  description: null,
};

const VALID_CATEGORIES = new Set<string>([
  'none',
  'very-low',
  'low',
  'moderate',
  'high',
  'very-high',
]);
const VALID_COLOR_TOKENS = new Set<string>(Object.keys(POLLEN_COLOR_BY_TOKEN));

function isPollenCategory(value: unknown): value is PollenCategory {
  return typeof value === 'string' && VALID_CATEGORIES.has(value);
}

function isPollenColorToken(value: unknown): value is PollenColorToken {
  return typeof value === 'string' && VALID_COLOR_TOKENS.has(value);
}

function colorTokenFromCategory(
  category: PollenCategory | null,
): PollenColorToken {
  if (!category) {
    return 'pollen.unavailable';
  }
  return `pollen.${category}` as PollenColorToken;
}

export function presentPollen(
  pollen: Pollen | null | undefined,
): PollenPresentation {
  if (!pollen || pollen.isAvailable !== true) {
    return { ...UNAVAILABLE_POLLEN };
  }

  const value = pollen.value;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { ...UNAVAILABLE_POLLEN };
  }

  const category = isPollenCategory(pollen.category) ? pollen.category : null;

  if (!category) {
    return { ...UNAVAILABLE_POLLEN };
  }

  const label =
    typeof pollen.label === 'string' && pollen.label.trim()
      ? pollen.label.trim()
      : 'Unavailable';

  if (label === 'Unavailable') {
    return { ...UNAVAILABLE_POLLEN };
  }

  const colorToken = isPollenColorToken(pollen.colorToken)
    ? pollen.colorToken
    : colorTokenFromCategory(category);

  return {
    available: true,
    value: Math.round(value),
    category,
    colorToken,
    color: POLLEN_COLOR_BY_TOKEN[colorToken],
    label,
    description:
      typeof pollen.description === 'string' ? pollen.description : null,
  };
}

export function formatPollenCompact(presentation: PollenPresentation): string {
  if (!presentation.available || presentation.value === null) {
    return 'Unavailable';
  }

  return `${presentation.value} · ${presentation.label}`;
}
