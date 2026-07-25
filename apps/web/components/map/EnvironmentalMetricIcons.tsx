/**
 * Environmental-metric icons for the phone Selected Location sheet.
 * Production-safe SVGs recreating the approved mockup’s bold, rounded
 * premium glyph language (~32px). Color via currentColor.
 */

import type { Climate } from "@/lib/weather/climate";

type IconProps = {
  className?: string;
  /** Accessible name; when set, the glyph is exposed to assistive tech. */
  title?: string;
};

const DEFAULT_SIZE = "h-8 w-8";

function iconA11y(title?: string) {
  return title
    ? ({ role: "img" as const, "aria-label": title })
    : ({ "aria-hidden": true as const });
}

/** Three stacked air-quality waves (mockup AQI glyph). */
export function EnvAqiIcon({ className = DEFAULT_SIZE, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.85"
      strokeLinecap="round"
      {...iconA11y(title)}
    >
      <path d="M2.6 7.1c2.3 0 3.45-1.75 4.85-1.75S10.9 7.1 12 7.1s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
      <path d="M2.6 12c2.3 0 3.45-1.75 4.85-1.75S10.9 12 12 12s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
      <path d="M2.6 16.9c2.3 0 3.45-1.75 4.85-1.75S10.9 16.9 12 16.9s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
    </svg>
  );
}

/** Saturated gold sun with short rounded rays (mockup UV glyph). */
export function EnvUvIcon({ className = DEFAULT_SIZE, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      {...iconA11y(title)}
    >
      <circle cx="12" cy="12" r="4.05" fill="currentColor" stroke="none" />
      <path d="M12 2.35v2.45M12 19.2v2.45M2.35 12h2.45M19.2 12h2.45M5.35 5.35l1.7 1.7M16.95 16.95l1.7 1.7M5.35 18.65l1.7-1.7M16.95 7.05l1.7-1.7" />
    </svg>
  );
}

/** Twin evergreen trees (mockup Pollen glyph) — fills the 24 box for equal weight. */
export function EnvPollenIcon({ className = DEFAULT_SIZE, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      {...iconA11y(title)}
    >
      {/* Left tree — shorter */}
      <path d="M6.2 20h3.4v-1.7H6.2V20Zm1.7-14.4L2.4 13.6h2.85L2.55 17.7h9.5l-2.65-4.1H12L7.9 5.6Z" />
      {/* Right tree — taller */}
      <path d="M14.7 20h3.5v-1.75h-3.5V20Zm1.75-16L9.7 11.6h2.85L9.7 16.3h10.7l-2.85-4.7h2.85L16.45 4Z" />
    </svg>
  );
}

/** Rich sky-blue water droplet (mockup Humidity glyph). */
export function EnvHumidityIcon({ className = DEFAULT_SIZE, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      {...iconA11y(title)}
    >
      <path d="M12 2.6C12 2.6 5.4 10.5 5.4 14.95a6.6 6.6 0 0 0 13.2 0C18.6 10.5 12 2.6 12 2.6Z" />
    </svg>
  );
}

/** Bright lavender eye (mockup Visibility glyph). */
export function EnvVisibilityIcon({ className = DEFAULT_SIZE, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconA11y(title)}
    >
      <path d="M2 12s3.85-6.6 10-6.6S22 12 22 12s-3.85 6.6-10 6.6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Climate icon family — Nature Elements (PRODUCTION — DESIGN FROZEN).
 * Concepts locked: Marine wave · Fog bank · fog→sun · sun · heat.
 * Land icons share one exact hill path; Marine is ocean-only.
 * Only optical micro-adjustments allowed after this freeze.
 */
const CLIMATE_STROKE = 2.2;
const GROUND_Y = 18.85;
/**
 * Exact shared hill silhouette for Fog Belt / Transition / Sun Belt / Inland.
 * Do not alter per-icon — family unity depends on this path being identical.
 */
const CLIMATE_HILL_LINE = `M2.7 ${GROUND_Y}c1.2 0 2.15-3.15 4.15-3.15 1.35 0 2.15 1.65 3 2.7.9-1.55 2.1-4 4.25-4 2.15 0 3.25 4.45 4.85 4.45`;

/** Marine: cresting ocean wave (ocean-only — not the land hill silhouette). */
export function EnvClimateMarineIcon({
  className = DEFAULT_SIZE,
  title = "Marine climate",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={CLIMATE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconA11y(title)}
    >
      {/* Soft shoreline swell — shared optical baseline with land icons */}
      <path d={`M3.2 ${GROUND_Y - 2.4}c1.55-1.7 3.1-1.7 4.65 0s3.1 1.7 4.65 0 3.1-1.7 4.65 0`} />
      {/* Cresting wave */}
      <path d="M4.2 13.6c1.5-4 4.2-6.4 7.4-4.8-1.3 2.2-.3 4.3 2.2 5.4" />
    </svg>
  );
}

/**
 * Fog Belt: low flat marine-layer bank across the hills.
 * Fog is the dominant mark — coastal fog belt, not a weather cloud.
 */
export function EnvClimateFogBeltIcon({
  className = DEFAULT_SIZE,
  title = "Fog Belt climate",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={CLIMATE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconA11y(title)}
    >
      <path d={CLIMATE_HILL_LINE} />
      <path d="M3.1 12.55h17.8a2.2 2.2 0 0 1 0 4.4H3.1a2.2 2.2 0 0 1 0-4.4Z" />
    </svg>
  );
}

/**
 * Transition: fog becoming sun — simplest mark in the family.
 * Low fog left, clean sun right, shared hills.
 */
export function EnvClimateTransitionIcon({
  className = DEFAULT_SIZE,
  title = "Transition climate",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={CLIMATE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconA11y(title)}
    >
      <path d={CLIMATE_HILL_LINE} />
      {/* Fog bank — same vertical band as Fog Belt, truncated */}
      <path d="M3.1 12.55h8.4a2.2 2.2 0 0 1 0 4.4H3.1a2.2 2.2 0 0 1 0-4.4Z" />
      <circle cx="17.15" cy="9.55" r="2.85" />
    </svg>
  );
}

/** Sun Belt: dominant sun close over the shared hills. */
export function EnvClimateSunBeltIcon({
  className = DEFAULT_SIZE,
  title = "Sun Belt climate",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={CLIMATE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconA11y(title)}
    >
      <path d={CLIMATE_HILL_LINE} />
      <circle cx="12" cy="8.85" r="3.45" />
      <path d="M12 4.15v1.15M7.55 8.85h1.15M15.3 8.85h1.15" />
    </svg>
  );
}

/** Inland: heat shimmer over the shared hills. */
export function EnvClimateInlandIcon({
  className = DEFAULT_SIZE,
  title = "Inland climate",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={CLIMATE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...iconA11y(title)}
    >
      <path d={CLIMATE_HILL_LINE} />
      <path d="M9.3 11.1c.7-.95-.45-1.7.35-2.7.65-.85-.45-1.55.35-2.5" />
      <path d="M12 11.1c.7-.95-.45-1.7.35-2.7.65-.85-.45-1.55.35-2.5" />
      <path d="M14.7 11.1c.7-.95-.45-1.7.35-2.7.65-.85-.45-1.55.35-2.5" />
    </svg>
  );
}

/** Resolve the Climate environmental-tile icon for a canonical classification. */
export function EnvClimateIcon({
  climate,
  className = DEFAULT_SIZE,
  title,
}: IconProps & { climate: Climate }) {
  const label = title ?? `${climate} climate`;
  switch (climate) {
    case "Marine":
      return <EnvClimateMarineIcon className={className} title={label} />;
    case "Fog Belt":
      return <EnvClimateFogBeltIcon className={className} title={label} />;
    case "Transition":
      return <EnvClimateTransitionIcon className={className} title={label} />;
    case "Sun Belt":
      return <EnvClimateSunBeltIcon className={className} title={label} />;
    case "Inland":
      return <EnvClimateInlandIcon className={className} title={label} />;
  }
}

/** Bright white cloud over fog waves (mockup Marine Layer glyph). */
export function EnvMarineLayerIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        fill="currentColor"
        stroke="none"
        d="M6.9 11.7h10.4a3.55 3.55 0 0 0 .45-7 5 5 0 0 0-9.55-1.3A3.8 3.8 0 0 0 6.9 11.7Z"
      />
      <path d="M2.9 15c2.05 0 3.05-1.25 4.2-1.25s2.2 1.25 4.75 1.25 3.35-1.25 4.4-1.25 2.4 1.25 4.35 1.25" />
      <path d="M4.1 18.15c1.65 0 2.45-1.05 3.4-1.05s1.8 1.05 3.9 1.05 2.7-1.05 3.7-1.05 2.05 1.05 3.7 1.05" />
      <path d="M5.4 21.15c1.4 0 2.1-.85 2.95-.85s1.55.85 3.35.85 2.3-.85 3.15-.85 1.7.85 3.15.85" />
    </svg>
  );
}

/** Bright white cloud outline (mockup Fog Ceiling glyph). */
export function EnvFogCeilingIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.6 16.85h11.2a3.85 3.85 0 0 0 .5-7.65 5.4 5.4 0 0 0-10.4-1.4A4.15 4.15 0 0 0 6.6 16.85Z" />
    </svg>
  );
}
