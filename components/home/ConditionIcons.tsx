type IconProps = {
  className?: string;
};

export function FogCoverageIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M4 16.5c1.8 0 2.8-1 3.6-1.8.8.8 1.8 1.8 3.6 1.8s2.8-1 3.6-1.8c.8.8 1.8 1.8 3.6 1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 12.5c1.4 0 2.2-.8 2.8-1.5.6.7 1.4 1.5 2.8 1.5s2.2-.8 2.8-1.5c.6.7 1.4 1.5 2.8 1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KarlStatusIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M6 16c1.2 0 1.9-.7 2.5-1.3.6.6 1.3 1.3 2.5 1.3s1.9-.7 2.5-1.3c.6.6 1.3 1.3 2.5 1.3"
        strokeLinecap="round"
      />
      <path
        d="M8.5 11.5c.9 0 1.4-.5 1.8-1 .4.5.9 1 1.8 1s1.4-.5 1.8-1c.4.5.9 1 1.8 1"
        strokeLinecap="round"
      />
      <path d="M12 6.5v1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SunshineIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 4.25a.75.75 0 0 1 .75.75v1.6a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 .75-.75Zm0 11.9a.75.75 0 0 1 .75.75v1.6a.75.75 0 0 1-1.5 0v-1.6a.75.75 0 0 1 .75-.75ZM5 12a.75.75 0 0 1 .75-.75h1.6a.75.75 0 0 1 0 1.5H5.75A.75.75 0 0 1 5 12Zm11.9 0a.75.75 0 0 1 .75-.75h1.6a.75.75 0 0 1 0 1.5h-1.6A.75.75 0 0 1 16.9 12ZM7.05 7.05a.75.75 0 0 1 1.06 0l1.13 1.13a.75.75 0 1 1-1.06 1.06L7.05 8.11a.75.75 0 0 1 0-1.06Zm9.77 9.77a.75.75 0 0 1 1.06 0l1.13 1.13a.75.75 0 1 1-1.06 1.06l-1.13-1.13a.75.75 0 0 1 0-1.06ZM16.95 7.05a.75.75 0 0 1 0 1.06l-1.13 1.13a.75.75 0 0 1-1.06-1.06l1.13-1.13a.75.75 0 0 1 1.06 0ZM8.18 16.82a.75.75 0 0 1 0 1.06l-1.13 1.13a.75.75 0 0 1-1.06-1.06l1.13-1.13a.75.75 0 0 1 1.06 0ZM12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
    </svg>
  );
}

export function MoonIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M13.2 3.4a.75.75 0 0 1 .92.92 6.9 6.9 0 1 0 5.54 5.54.75.75 0 0 1 .92.92 8.4 8.4 0 1 1-7.38-7.38Z" />
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
      strokeWidth="2"
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
