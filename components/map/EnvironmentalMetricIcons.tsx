/**
 * Restrained environmental-metric icons for the phone Selected Location sheet.
 * Inline SVGs using currentColor so tiles can apply canonical semantic colors.
 * No new icon package — matches the ConditionIcons stroke/fill idiom.
 */

type IconProps = {
  className?: string;
};

/** Soft wave / air quality glyph. */
export function EnvAqiIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M3 9c2.2 0 3.4-1.5 4.6-1.5S10.2 9 12 9s3.2-1.5 4.4-1.5S18.8 9 21 9" />
      <path d="M3 14c2.2 0 3.4-1.5 4.6-1.5S10.2 14 12 14s3.2-1.5 4.4-1.5S18.8 14 21 14" />
      <path d="M3 19c2.2 0 3.4-1.5 4.6-1.5S10.2 19 12 19s3.2-1.5 4.4-1.5S18.8 19 21 19" />
    </svg>
  );
}

/** Compact sun for UV Index. */
export function EnvUvIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="3.4" fill="currentColor" opacity="0.92" />
      <path d="M12 3.8v2.1M12 18.1v2.1M3.8 12h2.1M18.1 12h2.1M6.3 6.3l1.5 1.5M16.2 16.2l1.5 1.5M6.3 17.7l1.5-1.5M16.2 7.8l1.5-1.5" />
    </svg>
  );
}

/** Simple tree/leaf glyph for pollen. */
export function EnvPollenIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21v-7" />
      <path d="M12 14c-3.4-1.1-5.6-3.6-5.6-6.6C6.4 4.8 9 3 12 3c3 0 5.6 1.8 5.6 4.4 0 3-2.2 5.5-5.6 6.6Z" />
      <path d="M9.2 9.4c1.1.6 2.2.9 2.8.9s1.7-.3 2.8-.9" opacity="0.7" />
    </svg>
  );
}

/** Droplet for humidity. */
export function EnvHumidityIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path
        d="M12 3.2C12 3.2 6.5 10.1 6.5 14.2a5.5 5.5 0 0 0 11 0C17.5 10.1 12 3.2 12 3.2Z"
        opacity="0.92"
      />
    </svg>
  );
}

/** Eye for visibility. */
export function EnvVisibilityIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.8 12s3.4-5.6 9.2-5.6S21.2 12 21.2 12s-3.4 5.6-9.2 5.6S2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/** Heart outline for Karl Health Index (placeholder). */
export function EnvKhiIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinejoin="round"
    >
      <path d="M12 20.4 4.8 13.6a4.4 4.4 0 0 1 6.2-6.2L12 8.4l1 1a4.4 4.4 0 0 1 6.2 6.2L12 20.4Z" />
    </svg>
  );
}

/** Low marine fog waves for Marine Layer placeholder. */
export function EnvMarineLayerIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
    >
      <ellipse cx="12" cy="8.4" rx="5.4" ry="3.2" opacity="0.78" />
      <path d="M4 14.2c1.8 0 2.8-1.1 3.8-1.1s2 1.1 4.2 1.1 2.9-1.1 4-1.1 2.2 1.1 3.8 1.1" />
      <path
        d="M5.5 17.6c1.4 0 2.2-.9 3-.9s1.6.9 3.5.9 2.4-.9 3.3-.9 1.8.9 3.2.9"
        opacity="0.95"
      />
    </svg>
  );
}

/** Cloud with ceiling marker for Fog Ceiling placeholder. */
export function EnvFogCeilingIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.8 15.2h9.4a3.2 3.2 0 0 0 .4-6.4 4.6 4.6 0 0 0-8.8-1.2A3.5 3.5 0 0 0 7.8 15.2Z" />
      <path d="M8 19h8" opacity="0.95" />
    </svg>
  );
}
