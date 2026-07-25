/**
 * Canonical Climate presentation for the phone Map environmental sheet.
 *
 * Climate is stable location metadata from the backend catalog — not a live
 * weather metric. Allowed public values match the backend exactly.
 */

export const CLIMATE_VALUES = [
  "Marine",
  "Fog Belt",
  "Transition",
  "Sun Belt",
  "Inland",
] as const;

export type Climate = (typeof CLIMATE_VALUES)[number];

export type ClimatePresentation = {
  available: boolean;
  value: Climate | null;
  /** Display string such as "Marine" or "Unavailable". */
  formatted: string;
  /** Accessible icon label such as "Marine climate". */
  iconLabel: string;
  /**
   * Short descriptor beneath the climate name (e.g. "Coastal"), matching
   * other environmental supporting labels ("Good", "Comfortable", …).
   */
  label: string | null;
};

const CLIMATE_SET = new Set<string>(CLIMATE_VALUES);

/** Canonical one-word descriptors for the Climate environmental tile. */
export const CLIMATE_DESCRIPTOR: Record<Climate, string> = {
  Marine: "Coastal",
  "Fog Belt": "Foggy",
  Transition: "Mixed",
  "Sun Belt": "Sunny",
  Inland: "Dry",
};

const UNAVAILABLE_CLIMATE: ClimatePresentation = {
  available: false,
  value: null,
  formatted: "Unavailable",
  iconLabel: "Climate unavailable",
  label: null,
};

export function isClimate(value: unknown): value is Climate {
  return typeof value === "string" && CLIMATE_SET.has(value);
}

/**
 * Present a canonical Climate value for the environmental tile.
 * Missing or unsupported strings become Unavailable (never crash the sheet).
 */
export function presentClimate(climate: unknown): ClimatePresentation {
  if (!isClimate(climate)) {
    return UNAVAILABLE_CLIMATE;
  }

  return {
    available: true,
    value: climate,
    formatted: climate,
    iconLabel: `${climate} climate`,
    label: CLIMATE_DESCRIPTOR[climate],
  };
}

/** Presentation accent colors for Climate icons (env-sheet local mapping). */
export const CLIMATE_ICON_COLOR: Record<Climate, string> = {
  Marine: "#3DB4FF",
  "Fog Belt": "#94A8B8",
  Transition: "#7DD3C0",
  "Sun Belt": "#F5B000",
  Inland: "#F07838",
};
