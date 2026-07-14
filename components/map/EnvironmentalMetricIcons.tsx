/**
 * Environmental-metric icons for the phone Selected Location sheet.
 * Production-safe SVGs recreating the approved mockup’s bold, rounded
 * premium glyph language (~32px). Color via currentColor.
 */

type IconProps = {
  className?: string;
};

const DEFAULT_SIZE = "h-8 w-8";

/** Three stacked air-quality waves (mockup AQI glyph). */
export function EnvAqiIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.85"
      strokeLinecap="round"
    >
      <path d="M2.6 7.1c2.3 0 3.45-1.75 4.85-1.75S10.9 7.1 12 7.1s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
      <path d="M2.6 12c2.3 0 3.45-1.75 4.85-1.75S10.9 12 12 12s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
      <path d="M2.6 16.9c2.3 0 3.45-1.75 4.85-1.75S10.9 16.9 12 16.9s3.35-1.75 4.25-1.75 2.7 1.75 5.15 1.75" />
    </svg>
  );
}

/** Saturated gold sun with short rounded rays (mockup UV glyph). */
export function EnvUvIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4.05" fill="currentColor" stroke="none" />
      <path d="M12 2.35v2.45M12 19.2v2.45M2.35 12h2.45M19.2 12h2.45M5.35 5.35l1.7 1.7M16.95 16.95l1.7 1.7M5.35 18.65l1.7-1.7M16.95 7.05l1.7-1.7" />
    </svg>
  );
}

/** Twin evergreen trees (mockup Pollen glyph) — fills the 24 box for equal weight. */
export function EnvPollenIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      {/* Left tree — shorter */}
      <path d="M6.2 20h3.4v-1.7H6.2V20Zm1.7-14.4L2.4 13.6h2.85L2.55 17.7h9.5l-2.65-4.1H12L7.9 5.6Z" />
      {/* Right tree — taller */}
      <path d="M14.7 20h3.5v-1.75h-3.5V20Zm1.75-16L9.7 11.6h2.85L9.7 16.3h10.7l-2.85-4.7h2.85L16.45 4Z" />
    </svg>
  );
}

/** Rich sky-blue water droplet (mockup Humidity glyph). */
export function EnvHumidityIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2.6C12 2.6 5.4 10.5 5.4 14.95a6.6 6.6 0 0 0 13.2 0C18.6 10.5 12 2.6 12 2.6Z" />
    </svg>
  );
}

/** Bright lavender eye (mockup Visibility glyph). */
export function EnvVisibilityIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.85-6.6 10-6.6S22 12 22 12s-3.85 6.6-10 6.6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Coral/pink heart outline (mockup KHI glyph — used even for Coming Soon). */
export function EnvKhiIcon({ className = DEFAULT_SIZE }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.55 4.6 13.4a4.9 4.9 0 0 1 6.9-6.95L12 7.2l.5.55a4.9 4.9 0 0 1 6.9 6.95L12 20.55Z" />
    </svg>
  );
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
