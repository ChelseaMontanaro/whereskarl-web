/**
 * Canonical UV Index presentation for all product surfaces.
 *
 * Category, label, colorToken, and availability are owned by the backend and
 * arrive on location weather payloads as `uvIndex`. This module maps the
 * backend `colorToken` onto platform colors — it does not re-derive UV Index
 * bands.
 *
 * Phone Selected Location is the first UI consumer of this helper. Desktop /
 * tablet Selected Location intentionally defer UV (product decision — keep the
 * compact AQI chip; desktop UV needs its own layout pass). Map, Home,
 * Favorites, Notifications, Environmental Health, Widgets, and other future
 * surfaces should reuse these helpers (or the same `colorToken` → platform
 * color map on native) — never ad-hoc thresholds or surface-specific UV models.
 */

import type {
  UltravioletIndex,
  UltravioletIndexCategory,
} from "@/lib/schemas/weather";

export type { UltravioletIndex, UltravioletIndexCategory };

export type UltravioletIndexColorToken =
  | "uv.low"
  | "uv.moderate"
  | "uv.high"
  | "uv.very-high"
  | "uv.extreme"
  | "uv.unavailable";

/**
 * Single platform color registry keyed by backend `colorToken`.
 * Every surface that colors UV should use this map (or the same tokens on
 * native) — never ad-hoc category→hex maps.
 */
export const UV_INDEX_COLOR_BY_TOKEN: Record<
  UltravioletIndexColorToken,
  string | null
> = {
  "uv.low": "#22E36B",
  "uv.moderate": "#F5A623",
  "uv.high": "#F97316",
  "uv.very-high": "#FF5A5F",
  "uv.extreme": "#A855F7",
  "uv.unavailable": null,
};

/** @deprecated Prefer UV_INDEX_COLOR_BY_TOKEN keyed by backend colorToken. */
export const UV_INDEX_COLORS: Record<UltravioletIndexCategory, string> = {
  low: UV_INDEX_COLOR_BY_TOKEN["uv.low"]!,
  moderate: UV_INDEX_COLOR_BY_TOKEN["uv.moderate"]!,
  high: UV_INDEX_COLOR_BY_TOKEN["uv.high"]!,
  "very-high": UV_INDEX_COLOR_BY_TOKEN["uv.very-high"]!,
  extreme: UV_INDEX_COLOR_BY_TOKEN["uv.extreme"]!,
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
  colorToken: "uv.unavailable",
  color: null,
  label: "Unavailable",
  description: null,
};

const VALID_CATEGORIES = new Set<string>(Object.keys(UV_INDEX_COLORS));
const VALID_COLOR_TOKENS = new Set<string>(Object.keys(UV_INDEX_COLOR_BY_TOKEN));

function isUltravioletIndexCategory(
  value: unknown,
): value is UltravioletIndexCategory {
  return typeof value === "string" && VALID_CATEGORIES.has(value);
}

function isUltravioletIndexColorToken(
  value: unknown,
): value is UltravioletIndexColorToken {
  return typeof value === "string" && VALID_COLOR_TOKENS.has(value);
}

function colorTokenFromCategory(
  category: UltravioletIndexCategory | null,
): UltravioletIndexColorToken {
  if (!category) {
    return "uv.unavailable";
  }
  return `uv.${category}` as UltravioletIndexColorToken;
}

/**
 * Present canonical UV Index for UI.
 *
 * Accepts the backend `uvIndex` object. Invalid or unavailable payloads
 * resolve to a restrained Unavailable state — never 0, NaN, or a false "Low".
 */
export function presentUvIndex(
  uvIndex: UltravioletIndex | null | undefined,
): UltravioletIndexPresentation {
  if (!uvIndex || uvIndex.isAvailable !== true) {
    return { ...UNAVAILABLE_UV_INDEX };
  }

  const value = uvIndex.value;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { ...UNAVAILABLE_UV_INDEX };
  }

  const category = isUltravioletIndexCategory(uvIndex.category)
    ? uvIndex.category
    : null;

  if (!category) {
    return { ...UNAVAILABLE_UV_INDEX };
  }

  const label =
    typeof uvIndex.label === "string" && uvIndex.label.trim()
      ? uvIndex.label.trim()
      : "Unavailable";

  if (label === "Unavailable") {
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
      typeof uvIndex.description === "string" ? uvIndex.description : null,
  };
}

/** Compact copy for any surface: `8 · Very High` or `Unavailable`. */
export function formatUvIndexCompact(
  presentation: UltravioletIndexPresentation,
): string {
  if (!presentation.available || presentation.value === null) {
    return "Unavailable";
  }

  return `${presentation.value} · ${presentation.label}`;
}
