/**
 * Map marker icon markup — aligned with whereskarl-web/lib/map/markerIcons.ts.
 */

import { CLEAR_SUN_COLOR } from '@/lib/map/markerAppearance';
import type { FogIntensity } from '@/lib/map/locationsDisplay';

const SUN_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-universal-map-marker__svg">
  <circle cx="12" cy="12" r="4.1" fill="${CLEAR_SUN_COLOR}" />
  <path d="M12 4.25v2.1M12 17.65v2.1M4.25 12h2.1M17.65 12h2.1M6.55 6.55l1.48 1.48M16.97 16.97l1.48 1.48M6.55 17.45l1.48-1.48M16.97 7.03l1.48-1.48" stroke="${CLEAR_SUN_COLOR}" stroke-width="1.35" stroke-linecap="round" />
</svg>`;

const LIGHT_FOG_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-universal-map-marker__svg">
  <ellipse cx="12" cy="11" rx="6.8" ry="4" fill="#D8E8F4" opacity="0.92" />
  <ellipse cx="7.8" cy="12" rx="3.6" ry="2.8" fill="#EAF3FA" opacity="0.88" />
  <ellipse cx="16.2" cy="12" rx="3.6" ry="2.8" fill="#EAF3FA" opacity="0.88" />
  <ellipse cx="12" cy="9.8" rx="4.6" ry="2.8" fill="#F4F9FC" />
</svg>`;

const FOGGY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-universal-map-marker__svg">
  <ellipse cx="12" cy="9.5" rx="6.5" ry="4.2" fill="#C5DDF0" />
  <ellipse cx="7.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="16.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="12" cy="8" rx="4.8" ry="3" fill="#F2F8FC" />
  <path d="M4 16.5c1.5 0 2.4-.85 3.1-1.55.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55" stroke="#93B8D8" stroke-width="1.2" stroke-linecap="round" opacity="0.88" />
</svg>`;

const KARL_TERRITORY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-universal-map-marker__svg">
  <ellipse cx="12" cy="10.5" rx="7" ry="4.4" fill="#8CB8D8" />
  <ellipse cx="7" cy="11.5" rx="4" ry="3.2" fill="#B8D4EA" />
  <ellipse cx="17" cy="11.5" rx="4" ry="3.2" fill="#B8D4EA" />
  <path d="M5 17.5c1.8 0 2.8-.9 3.6-1.7.8.8 1.8 1.7 3.6 1.7s2.8-.9 3.6-1.7c.8.8 1.8 1.7 3.6 1.7" stroke="#C5DDF0" stroke-width="1.2" stroke-linecap="round" opacity="0.9" />
</svg>`;

export function getMarkerIconMarkup(intensity: FogIntensity): string {
  switch (intensity) {
    case 'clear':
      return SUN_ICON;
    case 'lightFog':
      return LIGHT_FOG_ICON;
    case 'foggy':
      return FOGGY_ICON;
    case 'karlTerritory':
      return KARL_TERRITORY_ICON;
  }
}

export function getMarkerConditionSymbol(intensity: FogIntensity): string {
  switch (intensity) {
    case 'clear':
      return '☀';
    case 'lightFog':
      return '◌';
    case 'foggy':
      return '☁';
    case 'karlTerritory':
      return '☁';
  }
}
