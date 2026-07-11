/**
 * Phone-portrait web condition icons — illustrated artwork matching the
 * approved mobile mockup. Solid fills only (no duplicate gradient ids).
 */

import type { FogIntensity } from "@/lib/map/conditions";
import {
  resolvePhonePortraitIsNighttime,
  type PhonePortraitPresentationOptions,
} from "@/lib/map/phonePortraitPresentation";

/** Daytime clear: warm sun with a small cloud. */
const SUN_CLOUD_DETAILED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" fill="none">
  <circle cx="34.5" cy="13.5" r="8.2" fill="#F2A326" opacity="0.95" />
  <circle cx="34.5" cy="13.5" r="6.2" fill="#F6C15A" opacity="0.88" />
  <path d="M34.5 3.8v3.2M34.5 20v3.2M24.2 13.5h3.2M42.8 13.5h3.2M27.4 6.4l2.3 2.3M39.3 18.3l2.3 2.3M27.4 20.6l2.3-2.3M39.3 8.7l2.3-2.3" stroke="#F2A326" stroke-width="1.8" stroke-linecap="round" opacity="0.9" />
  <g>
    <rect x="6.8" y="29.8" width="21.5" height="7.4" rx="3.7" fill="#E4EEF7" />
    <circle cx="11.2" cy="31.6" r="5" fill="#EDF4FA" />
    <circle cx="18.2" cy="28.4" r="6.1" fill="#FAFDFF" />
    <circle cx="24.8" cy="31.8" r="4.6" fill="#D5E5F2" />
    <circle cx="16.2" cy="27.2" r="3.8" fill="#FFFFFF" opacity="0.85" />
  </g>
</svg>`;

/** Nighttime clear: icy-blue crescent moon with a soft cloud. */
const MOON_CLOUD_DETAILED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" fill="none">
  <path d="M36.5 8.2A15.6 15.6 0 1 1 15.9 29a12.6 12.6 0 0 0 20.6-20.8Z" fill="#9FC4E6" opacity="0.92" transform="rotate(-14 26 20)" />
  <path d="M34.2 10.4A13.2 13.2 0 0 1 18 27.2a12.6 12.6 0 0 0 16.2-16.8Z" fill="#C4DDF2" opacity="0.5" transform="rotate(-14 26 20)" />
  <g>
    <rect x="5.4" y="32.2" width="23" height="7.8" rx="3.9" fill="#E4EEF7" />
    <circle cx="9.8" cy="34.2" r="5.2" fill="#EDF4FA" />
    <circle cx="16.8" cy="30.8" r="6.4" fill="#FAFDFF" />
    <circle cx="23.6" cy="34.2" r="4.9" fill="#D5E5F2" />
    <circle cx="15" cy="29.2" r="4" fill="#FFFFFF" opacity="0.85" />
    <path d="M6.5 37.6h21" stroke="#B9CCDD" stroke-width="1.4" stroke-linecap="round" opacity="0.5" />
  </g>
</svg>`;

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

export function getPhonePortraitConditionIconSvg(
  intensity: FogIntensity,
  options: PhonePortraitPresentationOptions = {},
): string {
  switch (intensity) {
    case "clear":
      return resolvePhonePortraitIsNighttime(options)
        ? MOON_CLOUD_DETAILED_ICON
        : SUN_CLOUD_DETAILED_ICON;
    case "lightFog":
      return LIGHT_FOG_DETAILED_ICON;
    case "foggy":
      return FOGGY_DETAILED_ICON;
    case "karlTerritory":
      return KARL_TERRITORY_DETAILED_ICON;
  }
}

/**
 * Fog-rail icons reuse the approved condition artwork. Clear resolves to the
 * day/night sun or moon treatment (not the fog palette) so it reads distinctly
 * from the Light Fog and Foggy states.
 */
export function getPhonePortraitFogRailConditionIconDataUri(
  intensity: FogIntensity,
  options: PhonePortraitPresentationOptions = {},
): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    getPhonePortraitConditionIconSvg(intensity, options),
  )}`;
}

export function getPhonePortraitConditionIconDataUri(
  intensity: FogIntensity,
  options: PhonePortraitPresentationOptions = {},
): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    getPhonePortraitConditionIconSvg(intensity, options),
  )}`;
}

export function getPhonePortraitMarkerIconMarkup(
  intensity: FogIntensity,
  options: PhonePortraitPresentationOptions = {},
): string {
  return getPhonePortraitConditionIconSvg(intensity, options).replace(
    '<svg xmlns="http://www.w3.org/2000/svg"',
    '<svg class="karl-universal-map-marker__svg" xmlns="http://www.w3.org/2000/svg"',
  );
}
