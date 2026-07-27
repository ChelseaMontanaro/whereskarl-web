/**
 * Canonical UV Index presentation for universal product surfaces.
 * Mirrors whereskarl-web/lib/weather/uvIndex.ts — category / colorToken are
 * owned by the backend; this module only maps colorToken → platform color.
 *
 * Phone Selected Location is the first shipping UI consumer. Desktop/tablet
 * Selected Location intentionally defer UV (product decision, not a data-model
 * limit). Additional Map, Home, Favorites, Notifications, and Environmental
 * Health surfaces should reuse these helpers without a second UV model.
 */

import type {
  UltravioletIndex,
  UltravioletIndexCategory,
} from '@/types/weather';

export type { UltravioletIndex, UltravioletIndexCategory };

export type UltravioletIndexColorToken =
  | 'uv.low'
  | 'uv.moderate'
  | 'uv.high'
  | 'uv.very-high'
  | 'uv.extreme'
  | 'uv.unavailable';

export const UV_INDEX_COLOR_BY_TOKEN: Record<
  UltravioletIndexColorToken,
  string | null
> = {
  'uv.low': '#22E36B',
  'uv.moderate': '#F5A623',
  'uv.high': '#F97316',
  'uv.very-high': '#FF5A5F',
  'uv.extreme': '#A855F7',
  'uv.unavailable': null,
};

export type UltravioletIndexPresentation = {
  available: boolean;
  value: number | null;
  category: UltravioletIndexCategory | null;
  colorToken: UltravioletIndexColorToken;
  color: string | null;
  label: string;
  description: string | null;
};

const UNAVAILABLE_UV_INDEX: UltravioletIndexPresentation = {
  available: false,
  value: null,
  category: null,
  colorToken: 'uv.unavailable',
  color: null,
  label: 'Unavailable',
  description: null,
};

const VALID_CATEGORIES = new Set<string>([
  'low',
  'moderate',
  'high',
  'very-high',
  'extreme',
]);
const VALID_COLOR_TOKENS = new Set<string>(Object.keys(UV_INDEX_COLOR_BY_TOKEN));

function isUltravioletIndexCategory(
  value: unknown,
): value is UltravioletIndexCategory {
  return typeof value === 'string' && VALID_CATEGORIES.has(value);
}

function isUltravioletIndexColorToken(
  value: unknown,
): value is UltravioletIndexColorToken {
  return typeof value === 'string' && VALID_COLOR_TOKENS.has(value);
}

function colorTokenFromCategory(
  category: UltravioletIndexCategory | null,
): UltravioletIndexColorToken {
  if (!category) {
    return 'uv.unavailable';
  }
  return `uv.${category}` as UltravioletIndexColorToken;
}

export function presentUvIndex(
  uvIndex: UltravioletIndex | null | undefined,
): UltravioletIndexPresentation {
  if (!uvIndex || uvIndex.isAvailable !== true) {
    return { ...UNAVAILABLE_UV_INDEX };
  }

  const value = uvIndex.value;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { ...UNAVAILABLE_UV_INDEX };
  }

  const category = isUltravioletIndexCategory(uvIndex.category)
    ? uvIndex.category
    : null;

  if (!category) {
    return { ...UNAVAILABLE_UV_INDEX };
  }

  const label =
    typeof uvIndex.label === 'string' && uvIndex.label.trim()
      ? uvIndex.label.trim()
      : 'Unavailable';

  if (label === 'Unavailable') {
    return { ...UNAVAILABLE_UV_INDEX };
  }

  const colorToken = isUltravioletIndexColorToken(uvIndex.colorToken)
    ? uvIndex.colorToken
    : colorTokenFromCategory(category);

  return {
    available: true,
    value: Math.round(value),
    category,
    colorToken,
    color: UV_INDEX_COLOR_BY_TOKEN[colorToken],
    label,
    description:
      typeof uvIndex.description === 'string' ? uvIndex.description : null,
  };
}

export function formatUvIndexCompact(
  presentation: UltravioletIndexPresentation,
): string {
  if (!presentation.available || presentation.value === null) {
    return 'Unavailable';
  }

  return `${presentation.value} · ${presentation.label}`;
}
