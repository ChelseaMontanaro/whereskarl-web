/**
 * Canonical Pollen presentation for all product surfaces.
 *
 * Category, label, colorToken, and availability are owned by the backend and
 * arrive on location weather payloads as `pollen`. This module maps the
 * backend `colorToken` onto platform colors — it does not re-derive UPI bands.
 *
 * Phone Selected Location is the first UI consumer of this helper. Desktop /
 * tablet Selected Location intentionally defer pollen (product decision —
 * matching UV; desktop pollen needs its own layout pass). Map, Home,
 * Favorites, Notifications, Environmental Health, Widgets, and other future
 * surfaces should reuse these helpers — never ad-hoc thresholds or
 * surface-specific pollen models.
 */

import type { Pollen, PollenCategory } from "@/lib/schemas/weather";

export type { Pollen, PollenCategory };

export type PollenColorToken =
  | "pollen.none"
  | "pollen.very-low"
  | "pollen.low"
  | "pollen.moderate"
  | "pollen.high"
  | "pollen.very-high"
  | "pollen.unavailable";

/**
 * Single platform color registry keyed by backend `colorToken`.
 * Every surface that colors pollen should use this map (or the same tokens on
 * native) — never ad-hoc category→hex maps.
 */
export const POLLEN_COLOR_BY_TOKEN: Record<PollenColorToken, string | null> = {
  "pollen.none": "#22E36B",
  "pollen.very-low": "#84CC16",
  "pollen.low": "#F5A623",
  "pollen.moderate": "#F97316",
  "pollen.high": "#FF5A5F",
  "pollen.very-high": "#A855F7",
  "pollen.unavailable": null,
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
  colorToken: "pollen.unavailable",
  color: null,
  label: "Unavailable",
  description: null,
};

const VALID_CATEGORIES = new Set<string>([
  "none",
  "very-low",
  "low",
  "moderate",
  "high",
  "very-high",
]);
const VALID_COLOR_TOKENS = new Set<string>(Object.keys(POLLEN_COLOR_BY_TOKEN));

function isPollenCategory(value: unknown): value is PollenCategory {
  return typeof value === "string" && VALID_CATEGORIES.has(value);
}

function isPollenColorToken(value: unknown): value is PollenColorToken {
  return typeof value === "string" && VALID_COLOR_TOKENS.has(value);
}

function colorTokenFromCategory(
  category: PollenCategory | null,
): PollenColorToken {
  if (!category) {
    return "pollen.unavailable";
  }
  return `pollen.${category}` as PollenColorToken;
}

/**
 * Present canonical pollen for UI.
 *
 * Accepts the backend `pollen` object. Invalid or unavailable payloads
 * resolve to a restrained Unavailable state — never inventing a false "Low".
 */
export function presentPollen(
  pollen: Pollen | null | undefined,
): PollenPresentation {
  if (!pollen || pollen.isAvailable !== true) {
    return { ...UNAVAILABLE_POLLEN };
  }

  const value = pollen.value;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { ...UNAVAILABLE_POLLEN };
  }

  const category = isPollenCategory(pollen.category) ? pollen.category : null;

  if (!category) {
    return { ...UNAVAILABLE_POLLEN };
  }

  const label =
    typeof pollen.label === "string" && pollen.label.trim()
      ? pollen.label.trim()
      : "Unavailable";

  if (label === "Unavailable") {
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
      typeof pollen.description === "string" ? pollen.description : null,
  };
}

/** Compact copy for any surface: `3 · Moderate` or `Unavailable`. */
export function formatPollenCompact(presentation: PollenPresentation): string {
  if (!presentation.available || presentation.value === null) {
    return "Unavailable";
  }

  return `${presentation.value} · ${presentation.label}`;
}
