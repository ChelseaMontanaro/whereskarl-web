/**
 * Environmental-metric icons for the phone Selected Location sheet.
 *
 * Artwork ported verbatim from the approved mobile-web reference
 * (`apps/web/components/map/EnvironmentalMetricIcons.tsx`) so Map parity does
 * not introduce a second, divergent glyph family. Rendered the same way as the
 * rest of Universal's Map artwork: SVG string → data URI → `expo-image`
 * (React Native's own Image cannot render SVG data URIs).
 *
 * Web colours `currentColor` via a wrapping span; here the colour is
 * substituted into the markup, because a data URI has no inherited context.
 */

import type { Climate } from '@whereskarl/domain';

export type EnvironmentalMetricIconKind =
  | 'aqi'
  | 'uv'
  | 'pollen'
  | 'humidity'
  | 'visibility'
  | 'marineLayer'
  | 'fogCeiling';

/**
 * Presentation icon identity colours (independent of the canonical value
 * `colorToken`s, which still drive the numbers themselves).
 */
export const ENV_METRIC_ICON_COLOR = {
  aqi: '#3DB4FF',
  uv: '#FFD012',
  pollen: '#34D399',
  humidity: '#38BDF8',
  visibility: '#C4B5FD',
  climateUnavailable: '#94A8B8',
  marine: 'rgba(255, 255, 255, 0.95)',
} as const;

/**
 * Approved icon slot sizes. AQI and Pollen are ~15% larger than the 32pt
 * default for mockup presence; Climate is larger again for glanceability.
 */
export const ENV_METRIC_ICON_SIZE = {
  aqi: 37,
  uv: 32,
  pollen: 37,
  humidity: 32,
  visibility: 32,
  climate: 40,
  marine: 30,
} as const;

/** Shared fixed icon slot so every tile shares one optical centre. */
export const ENV_METRIC_ICON_SLOT = 37;

const CLIMATE_STROKE = 2.2;
const GROUND_Y = 18.85;

/**
 * Exact shared hill silhouette for Fog Belt / Transition / Sun Belt / Inland.
 * Family unity depends on this path being identical across those four icons.
 */
const CLIMATE_HILL_LINE = `M2.7 ${GROUND_Y}c1.2 0 2.15-3.15 4.15-3.15 1.35 0 2.15 1.65 3 2.7.9-1.55 2.1-4 4.25-4 2.15 0 3.25 4.45 4.85 4.45`;

function svg(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
}

/** Three stacked air-quality waves. */
function aqiIcon(color: string): string {
  return svg(
    `<g fill="none" stroke="${color}" stroke-width="2.85" stroke-linecap="round">
      <path d="M2.6 7.1c2.3 0 3.45-1.75 4.85-1.75S10.9 7.1 12 7.1s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
      <path d="M2.6 12c2.3 0 3.45-1.75 4.85-1.75S10.9 12 12 12s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
      <path d="M2.6 16.9c2.3 0 3.45-1.75 4.85-1.75S10.9 16.9 12 16.9s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
    </g>`,
  );
}

/** Saturated sun with short rounded rays. */
function uvIcon(color: string): string {
  return svg(
    `<circle cx="12" cy="12" r="4.05" fill="${color}" />
    <path d="M12 2.35v2.45M12 19.2v2.45M2.35 12h2.45M19.2 12h2.45M5.35 5.35l1.7 1.7M16.95 16.95l1.7 1.7M5.35 18.65l1.7-1.7M16.95 7.05l1.7-1.7" fill="none" stroke="${color}" stroke-width="2.7" stroke-linecap="round" />`,
  );
}

/** Twin evergreen trees. */
function pollenIcon(color: string): string {
  return svg(
    `<g fill="${color}">
      <path d="M6.2 20h3.4v-1.7H6.2V20Zm1.7-14.4L2.4 13.6h2.85L2.55 17.7h9.5l-2.65-4.1H12L7.9 5.6Z" />
      <path d="M14.7 20h3.5v-1.75h-3.5V20Zm1.75-16L9.7 11.6h2.85L9.7 16.3h10.7l-2.85-4.7h2.85L16.45 4Z" />
    </g>`,
  );
}

/** Water droplet. */
function humidityIcon(color: string): string {
  return svg(
    `<path fill="${color}" d="M12 2.6C12 2.6 5.4 10.5 5.4 14.95a6.6 6.6 0 0 0 13.2 0C18.6 10.5 12 2.6 12 2.6Z" />`,
  );
}

/** Eye. */
function visibilityIcon(color: string): string {
  return svg(
    `<path d="M2 12s3.85-6.6 10-6.6S22 12 22 12s-3.85 6.6-10 6.6S2 12 2 12Z" fill="none" stroke="${color}" stroke-width="2.65" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="12" cy="12" r="3" fill="${color}" />`,
  );
}

/** Marine: cresting ocean wave (ocean-only — not the land hill silhouette). */
function climateMarineIcon(color: string): string {
  return svg(
    `<g fill="none" stroke="${color}" stroke-width="${CLIMATE_STROKE}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3.2 ${GROUND_Y - 2.4}c1.55-1.7 3.1-1.7 4.65 0s3.1 1.7 4.65 0 3.1-1.7 4.65 0" />
      <path d="M4.2 13.6c1.5-4 4.2-6.4 7.4-4.8-1.3 2.2-.3 4.3 2.2 5.4" />
    </g>`,
  );
}

/** Fog Belt: low flat marine-layer bank across the hills. */
function climateFogBeltIcon(color: string): string {
  return svg(
    `<g fill="none" stroke="${color}" stroke-width="${CLIMATE_STROKE}" stroke-linecap="round" stroke-linejoin="round">
      <path d="${CLIMATE_HILL_LINE}" />
      <path d="M3.1 12.55h17.8a2.2 2.2 0 0 1 0 4.4H3.1a2.2 2.2 0 0 1 0-4.4Z" />
    </g>`,
  );
}

/** Transition: fog becoming sun. */
function climateTransitionIcon(color: string): string {
  return svg(
    `<g fill="none" stroke="${color}" stroke-width="${CLIMATE_STROKE}" stroke-linecap="round" stroke-linejoin="round">
      <path d="${CLIMATE_HILL_LINE}" />
      <path d="M3.1 12.55h8.4a2.2 2.2 0 0 1 0 4.4H3.1a2.2 2.2 0 0 1 0-4.4Z" />
      <circle cx="17.15" cy="9.55" r="2.85" />
    </g>`,
  );
}

/** Sun Belt: dominant sun close over the shared hills. */
function climateSunBeltIcon(color: string): string {
  return svg(
    `<g fill="none" stroke="${color}" stroke-width="${CLIMATE_STROKE}" stroke-linecap="round" stroke-linejoin="round">
      <path d="${CLIMATE_HILL_LINE}" />
      <circle cx="12" cy="8.85" r="3.45" />
      <path d="M12 4.15v1.15M7.55 8.85h1.15M15.3 8.85h1.15" />
    </g>`,
  );
}

/** Inland: heat shimmer over the shared hills. */
function climateInlandIcon(color: string): string {
  return svg(
    `<g fill="none" stroke="${color}" stroke-width="${CLIMATE_STROKE}" stroke-linecap="round" stroke-linejoin="round">
      <path d="${CLIMATE_HILL_LINE}" />
      <path d="M9.3 11.1c.7-.95-.45-1.7.35-2.7.65-.85-.45-1.55.35-2.5" />
      <path d="M12 11.1c.7-.95-.45-1.7.35-2.7.65-.85-.45-1.55.35-2.5" />
      <path d="M14.7 11.1c.7-.95-.45-1.7.35-2.7.65-.85-.45-1.55.35-2.5" />
    </g>`,
  );
}

/** Cloud over fog waves. */
function marineLayerIcon(color: string): string {
  return svg(
    `<path fill="${color}" d="M6.9 11.7h10.4a3.55 3.55 0 0 0 .45-7 5 5 0 0 0-9.55-1.3A3.8 3.8 0 0 0 6.9 11.7Z" />
    <g fill="none" stroke="${color}" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2.9 15c2.05 0 3.05-1.25 4.2-1.25s2.2 1.25 4.75 1.25 3.35-1.25 4.4-1.25 2.4 1.25 4.35 1.25" />
      <path d="M4.1 18.15c1.65 0 2.45-1.05 3.4-1.05s1.8 1.05 3.9 1.05 2.7-1.05 3.7-1.05 2.05 1.05 3.7 1.05" />
      <path d="M5.4 21.15c1.4 0 2.1-.85 2.95-.85s1.55.85 3.35.85 2.3-.85 3.15-.85 1.7.85 3.15.85" />
    </g>`,
  );
}

/** Cloud outline. */
function fogCeilingIcon(color: string): string {
  return svg(
    `<path d="M6.6 16.85h11.2a3.85 3.85 0 0 0 .5-7.65 5.4 5.4 0 0 0-10.4-1.4A4.15 4.15 0 0 0 6.6 16.85Z" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`,
  );
}

const CLIMATE_ICON_BUILDERS: Record<Climate, (color: string) => string> = {
  Marine: climateMarineIcon,
  'Fog Belt': climateFogBeltIcon,
  Transition: climateTransitionIcon,
  'Sun Belt': climateSunBeltIcon,
  Inland: climateInlandIcon,
};

const ICON_BUILDERS: Record<
  EnvironmentalMetricIconKind,
  (color: string) => string
> = {
  aqi: aqiIcon,
  uv: uvIcon,
  pollen: pollenIcon,
  humidity: humidityIcon,
  visibility: visibilityIcon,
  marineLayer: marineLayerIcon,
  fogCeiling: fogCeilingIcon,
};

function toDataUri(markup: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

export function getEnvironmentalMetricIconUri(
  kind: EnvironmentalMetricIconKind,
  color: string,
): string {
  return toDataUri(ICON_BUILDERS[kind](color));
}

/**
 * Climate tile icon. `null` resolves to the Transition glyph, matching the
 * reference's unavailable fallback.
 */
export function getClimateMetricIconUri(
  climate: Climate | null | undefined,
  color: string,
): string {
  const build = climate ? CLIMATE_ICON_BUILDERS[climate] : climateTransitionIcon;

  return toDataUri(build(color));
}
