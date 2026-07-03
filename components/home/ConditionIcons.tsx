type IconProps = {
  className?: string;
};

/** Thin mist/fog lines — no face. Used for Fog Coverage, Karl Status, Karl's Read. */
function FogMistLines({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
    >
      <path d="M4 15.5c1.6 0 2.5-.9 3.2-1.6.7.7 1.6 1.6 3.2 1.6s2.5-.9 3.2-1.6c.7.7 1.6 1.6 3.2 1.6s2.5-.9 3.2-1.6c.7.7 1.6 1.6 3.2 1.6" />
      <path d="M6 11.5c1.2 0 1.9-.6 2.4-1.2.5.6 1.2 1.2 2.4 1.2s1.9-.6 2.4-1.2c.5.6 1.2 1.2 2.4 1.2s1.9-.6 2.4-1.2c.5.6 1.2 1.2 2.4 1.2" opacity="0.82" />
      <path d="M8 7.5c.9 0 1.4-.4 1.8-.9.4.5.9.9 1.8.9s1.4-.4 1.8-.9c.4.5.9.9 1.8.9s1.4-.4 1.8-.9c.4.5.9.9 1.8.9" opacity="0.55" />
    </svg>
  );
}

export function FogCoverageIcon(props: IconProps) {
  return <FogMistLines {...props} />;
}

export function KarlStatusIcon(props: IconProps) {
  return <FogMistLines {...props} />;
}

export function FogMistIcon(props: IconProps) {
  return <FogMistLines {...props} />;
}

export function SunshineIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
    >
      <circle cx="12" cy="12" r="3.75" strokeLinecap="round" />
      <path
        d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.8 6.8l1.4 1.4M15.8 15.8l1.4 1.4M6.8 17.2l1.4-1.4M15.8 8.2l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M15.5 5.2a7.2 7.2 0 1 0 6.2 10.8A9 9 0 0 1 15.5 5.2Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M6.2 7.2 7 9.6 9.4 10.4 7 11.2 6.2 13.6 5.4 11.2 3 10.4 5.4 9.6 6.2 7.2Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
