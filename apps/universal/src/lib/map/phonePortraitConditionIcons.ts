/**
 * Phone-portrait condition icons — aligned with mobile-web Map artwork.
 * Fog rail and map markers share the same intensity semantics; Clear uses
 * cloud-free sun/moon on both surfaces so fog tiers stay visually distinct.
 * Karl Territory markers use the brand KarlLogo (rendered by the marker view).
 */

import type { FogIntensity } from '@whereskarl/domain';

export type PhonePortraitIconOptions = {
  isNighttime?: boolean;
};

/** Daytime clear: warm sun only. */
const CLEAR_SUN_ONLY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" fill="none">
  <circle cx="24" cy="24" r="9" fill="#F2A326" opacity="0.95" />
  <circle cx="24" cy="24" r="6.8" fill="#F6C15A" opacity="0.9" />
  <path d="M24 5.5v4.2M24 38.3v4.2M5.5 24h4.2M38.3 24h4.2M11 11l3 3M34 34l3 3M11 37l3-3M34 14l3-3" stroke="#F2A326" stroke-width="2" stroke-linecap="round" opacity="0.9" />
</svg>`;

/** Nighttime clear: icy-blue crescent moon only. */
const CLEAR_MOON_ONLY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" fill="none">
  <path d="M24 10A14 14 0 0 0 24 38 A26 26 0 0 1 24 10Z" fill="#9FC4E6" opacity="0.92" />
</svg>`;

/** Soft pale wisp of fog — approved Light Fog. */
const LIGHT_FOG_DETAILED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" fill="none">
  <g opacity="0.96">
    <rect x="8" y="25.8" width="32.5" height="10.4" rx="5.2" fill="#C6CFD8" />
    <circle cx="16" cy="26.5" r="7.6" fill="#D2DAE1" />
    <circle cx="26.5" cy="22.5" r="9.4" fill="#DEE4EA" />
    <circle cx="34.8" cy="27.5" r="6.8" fill="#B7C1CC" />
    <circle cx="23.8" cy="19.8" r="5.6" fill="#EEF2F5" opacity="0.75" />
    <path d="M12 33.4c4-1.5 9.5-1.5 13 0 3.4 1.4 8 1.4 11.4 0" stroke="#A8B4C0" stroke-width="1.3" stroke-linecap="round" opacity="0.5" />
  </g>
</svg>`;

/** Fuller dimensional gray cloud with a soft fog band — approved Foggy. */
const FOGGY_DETAILED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" fill="none">
  <g opacity="0.96">
    <rect x="7" y="21.6" width="34.5" height="11.8" rx="5.9" fill="#AAB5C1" />
    <circle cx="15" cy="23.6" r="8.6" fill="#B6C0CB" />
    <circle cx="25.5" cy="18.4" r="10.6" fill="#C4CDD6" />
    <circle cx="34.6" cy="24.6" r="7.6" fill="#94A1AF" />
    <circle cx="22.4" cy="15.2" r="6" fill="#DCE2E9" opacity="0.7" />
    <circle cx="29.5" cy="17.4" r="4.6" fill="#CDD5DD" opacity="0.5" />
    <path d="M9.5 31.2h29.5" stroke="#8593A2" stroke-width="1.2" stroke-linecap="round" opacity="0.35" />
  </g>
  <path d="M12 38.6c2.4 0 3.6-1.2 4.7-2.2 1.1 1 2.3 2.2 4.7 2.2s3.6-1.2 4.7-2.2c1.1 1 2.3 2.2 4.7 2.2s3.6-1.2 4.7-2.2" stroke="#94A3B2" stroke-width="1.8" stroke-linecap="round" opacity="0.7" />
</svg>`;

/** Dense low gray cloud — Fog Intensity rail Karl Territory cell. */
const KARL_TERRITORY_DETAILED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" fill="none">
  <g opacity="0.96">
    <rect x="6" y="17.8" width="36.5" height="12.4" rx="6.2" fill="#8F9BA9" />
    <circle cx="14.5" cy="19.8" r="9" fill="#9AA6B3" />
    <circle cx="25" cy="14.6" r="11" fill="#A8B2BE" />
    <circle cx="34.8" cy="20.6" r="8" fill="#798694" />
    <circle cx="21.5" cy="11.4" r="6.2" fill="#C7CFD8" opacity="0.65" />
    <circle cx="29.5" cy="13.8" r="4.8" fill="#B7C0C9" opacity="0.45" />
    <path d="M8.5 27.6h31" stroke="#6B7885" stroke-width="1.2" stroke-linecap="round" opacity="0.35" />
  </g>
  <path d="M9.5 35.6c2.5 0 3.8-1.3 5-2.4 1.2 1.1 2.5 2.4 5 2.4s3.8-1.3 5-2.4c1.2 1.1 2.5 2.4 5 2.4s3.8-1.3 5-2.4" stroke="#8797A6" stroke-width="2" stroke-linecap="round" opacity="0.8" />
  <path d="M13.5 41c2.5 0 3.8-1.3 5-2.4 1.2 1.1 2.5 2.4 5 2.4s3.8-1.3 5-2.4c1.2 1.1 2.5 2.4 5 2.4" stroke="#8797A6" stroke-width="1.8" stroke-linecap="round" opacity="0.5" />
</svg>`;

function getClearSkyIconSvg(options: PhonePortraitIconOptions = {}): string {
  return options.isNighttime ? CLEAR_MOON_ONLY_ICON : CLEAR_SUN_ONLY_ICON;
}

export function getPhonePortraitConditionIconSvg(
  intensity: FogIntensity,
  options: PhonePortraitIconOptions = {},
): string {
  switch (intensity) {
    case 'clear':
      return getClearSkyIconSvg(options);
    case 'lightFog':
      return LIGHT_FOG_DETAILED_ICON;
    case 'foggy':
      return FOGGY_DETAILED_ICON;
    case 'karlTerritory':
      return KARL_TERRITORY_DETAILED_ICON;
  }
}

/** Fog-rail data URI — Clear is cloud-free sun/moon; fog tiers keep detailed clouds. */
export function getPhonePortraitFogRailConditionIconDataUri(
  intensity: FogIntensity,
  options: PhonePortraitIconOptions = {},
): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    getPhonePortraitConditionIconSvg(intensity, options),
  )}`;
}

/** Marker data URI for Clear / Light Fog / Foggy (Karl Territory uses KarlLogo). */
export function getPhonePortraitMarkerConditionIconDataUri(
  intensity: Exclude<FogIntensity, 'karlTerritory'>,
  options: PhonePortraitIconOptions = {},
): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    getPhonePortraitConditionIconSvg(intensity, options),
  )}`;
}

/** @deprecated Prefer fog-rail or marker-specific helpers. */
export function getPhonePortraitConditionIconDataUri(
  intensity: FogIntensity,
  options: PhonePortraitIconOptions = {},
): string {
  return getPhonePortraitFogRailConditionIconDataUri(intensity, options);
}

export function getPhonePortraitMarkerIconMarkup(
  intensity: FogIntensity,
  options: PhonePortraitIconOptions = {},
): string {
  const svg = getPhonePortraitConditionIconSvg(intensity, options);
  return svg.replace(
    '<svg xmlns="http://www.w3.org/2000/svg"',
    '<svg class="karl-universal-map-marker__svg" xmlns="http://www.w3.org/2000/svg"',
  );
}
