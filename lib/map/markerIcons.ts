import { KARL_LOGO_SRC } from "@/lib/brand/karlLogo";
import type { FogIntensity } from "@/lib/map/conditions";

const SUN_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-map-marker__svg">
  <circle cx="12" cy="12" r="4.1" fill="currentColor" opacity="0.95" />
  <path d="M12 4.25v2.1M12 17.65v2.1M4.25 12h2.1M17.65 12h2.1M6.55 6.55l1.48 1.48M16.97 16.97l1.48 1.48M6.55 17.45l1.48-1.48M16.97 7.03l1.48-1.48" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" opacity="0.92" />
</svg>`;

const MOON_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-map-marker__svg">
  <path d="M16.2 5.1a7.4 7.4 0 1 0 6.4 11.1A9.2 9.2 0 0 1 16.2 5.1Z" fill="#8CB8D8" opacity="0.95" />
  <path d="M6.4 7.4 7.1 9.6 9.3 10.3 7.1 11 6.4 13.2 5.7 11 3.5 10.3 5.7 9.6 6.4 7.4Z" fill="#C5DDF0" opacity="0.9" />
</svg>`;

/** Subtle single-layer cloud for light fog. */
const LIGHT_FOG_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-map-marker__svg">
  <ellipse cx="12" cy="11" rx="6.8" ry="4" fill="#D8E8F4" opacity="0.92" />
  <ellipse cx="7.8" cy="12" rx="3.6" ry="2.8" fill="#EAF3FA" opacity="0.88" />
  <ellipse cx="16.2" cy="12" rx="3.6" ry="2.8" fill="#EAF3FA" opacity="0.88" />
  <ellipse cx="12" cy="9.8" rx="4.6" ry="2.8" fill="#F4F9FC" />
</svg>`;

/** Stronger fog cloud with mist lines. */
const FOGGY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-map-marker__svg">
  <ellipse cx="12" cy="9.5" rx="6.5" ry="4.2" fill="#C5DDF0" />
  <ellipse cx="7.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="16.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="12" cy="8" rx="4.8" ry="3" fill="#F2F8FC" />
  <path d="M4 16.5c1.5 0 2.4-.85 3.1-1.55.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55" stroke="#93B8D8" stroke-width="1.2" stroke-linecap="round" opacity="0.88" />
  <path d="M6 19.5c1.1 0 1.7-.55 2.2-1.05.5.5 1.1 1.05 2.2 1.05s1.7-.55 2.2-1.05c.5.5 1.1 1.05 2.2 1.05s1.7-.55 2.2-1.05c.5.5 1.1 1.05 2.2 1.05" stroke="#B8D4EA" stroke-width="1" stroke-linecap="round" opacity="0.62" />
</svg>`;

const KARL_TERRITORY_ICON = `<img src="${KARL_LOGO_SRC}" alt="" aria-hidden="true" class="karl-map-marker__logo" width="26" height="26" />`;

export type MarkerIconOptions = {
  isNighttime?: boolean;
};

export function getMarkerIconMarkup(
  intensity: FogIntensity | "neutral",
  options: MarkerIconOptions = {},
): string {
  const isNighttime = options.isNighttime ?? false;

  switch (intensity) {
    case "clear":
    case "neutral":
      return isNighttime ? MOON_ICON : SUN_ICON;
    case "lightFog":
      return LIGHT_FOG_ICON;
    case "foggy":
      return FOGGY_ICON;
    case "karlTerritory":
      return KARL_TERRITORY_ICON;
  }
}
