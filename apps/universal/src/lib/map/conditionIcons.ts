/**
 * Condition icon SVG markup — shared by map markers, fog legend, and preview cards.
 */

import { CLEAR_SUN_COLOR, CLEAR_MOON_COLOR } from '@/lib/map/markerAppearance';
import type { FogIntensity } from '@/lib/map/locationsDisplay';

export type ConditionIconOptions = {
  isNighttime?: boolean;
};

const SUN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
  <circle cx="12" cy="12" r="4.1" fill="${CLEAR_SUN_COLOR}" />
  <path d="M12 4.25v2.1M12 17.65v2.1M4.25 12h2.1M17.65 12h2.1M6.55 6.55l1.48 1.48M16.97 16.97l1.48 1.48M6.55 17.45l1.48-1.48M16.97 7.03l1.48-1.48" stroke="${CLEAR_SUN_COLOR}" stroke-width="1.35" stroke-linecap="round" />
</svg>`;

/** Icy-blue crescent moon with a small cloud — clear night sky. */
const MOON_CLOUD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
  <path d="M16.2 5.1a7.4 7.4 0 1 0 6.4 11.1A9.2 9.2 0 0 1 16.2 5.1Z" fill="${CLEAR_MOON_COLOR}" opacity="0.95" />
  <ellipse cx="7.8" cy="17.2" rx="4.4" ry="2.5" fill="#B8D4EA" opacity="0.95" />
  <ellipse cx="10.8" cy="16.4" rx="2.8" ry="1.7" fill="#C5DDF0" opacity="0.92" />
</svg>`;

const LIGHT_FOG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
  <ellipse cx="12" cy="11" rx="6.8" ry="4" fill="#D8E8F4" opacity="0.92" />
  <ellipse cx="7.8" cy="12" rx="3.6" ry="2.8" fill="#EAF3FA" opacity="0.88" />
  <ellipse cx="16.2" cy="12" rx="3.6" ry="2.8" fill="#EAF3FA" opacity="0.88" />
  <ellipse cx="12" cy="9.8" rx="4.6" ry="2.8" fill="#F4F9FC" />
</svg>`;

const FOGGY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
  <ellipse cx="12" cy="9.5" rx="6.5" ry="4.2" fill="#C5DDF0" />
  <ellipse cx="7.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="16.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="12" cy="8" rx="4.8" ry="3" fill="#F2F8FC" />
  <path d="M4 16.5c1.5 0 2.4-.85 3.1-1.55.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55" stroke="#93B8D8" stroke-width="1.2" stroke-linecap="round" opacity="0.88" />
</svg>`;

const KARL_TERRITORY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
  <ellipse cx="12" cy="10.5" rx="7" ry="4.4" fill="#8CB8D8" />
  <ellipse cx="7" cy="11.5" rx="4" ry="3.2" fill="#B8D4EA" />
  <ellipse cx="17" cy="11.5" rx="4" ry="3.2" fill="#B8D4EA" />
  <path d="M5 17.5c1.8 0 2.8-.9 3.6-1.7.8.8 1.8 1.7 3.6 1.7s2.8-.9 3.6-1.7c.8.8 1.8 1.7 3.6 1.7" stroke="#C5DDF0" stroke-width="1.2" stroke-linecap="round" opacity="0.9" />
</svg>`;

export function getConditionIconSvg(
  intensity: FogIntensity,
  options: ConditionIconOptions = {},
): string {
  const isNighttime = options.isNighttime ?? false;

  switch (intensity) {
    case 'clear':
      return isNighttime ? MOON_CLOUD_ICON : SUN_ICON;
    case 'lightFog':
      return LIGHT_FOG_ICON;
    case 'foggy':
      return FOGGY_ICON;
    case 'karlTerritory':
      return KARL_TERRITORY_ICON;
  }
}

export function getConditionIconDataUri(
  intensity: FogIntensity,
  options: ConditionIconOptions = {},
): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    getConditionIconSvg(intensity, options),
  )}`;
}
