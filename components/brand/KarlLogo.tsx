type KarlLogoProps = {
  className?: string;
};

export function KarlLogo({ className = "h-9 w-9" }: KarlLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <ellipse cx="20" cy="17" rx="11" ry="7.5" fill="rgb(210 225 240 / 0.92)" />
      <ellipse cx="13.5" cy="18.5" rx="5" ry="4.5" fill="rgb(198 218 238 / 0.88)" />
      <ellipse cx="26.5" cy="18.5" rx="5" ry="4.5" fill="rgb(198 218 238 / 0.88)" />
      <circle cx="16.5" cy="16.5" r="1.1" fill="rgb(9 27 42)" />
      <circle cx="23.5" cy="16.5" r="1.1" fill="rgb(9 27 42)" />
      <path
        d="M16 19.5c1.2 1.1 2.6 1.6 4 1.6s2.8-.5 4-1.6"
        stroke="rgb(9 27 42 / 0.72)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M8 26.5c2.2 0 3.4-1.1 4.4-2 .9 1 2.1 2 4.4 2s3.5-1 4.4-2c.9 1 2.1 2 4.4 2"
        stroke="rgb(210 225 240 / 0.55)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M10 30.5c1.8 0 2.8-.9 3.6-1.7.8.8 1.8 1.7 3.6 1.7s2.8-.9 3.6-1.7c.8.8 1.8 1.7 3.6 1.7"
        stroke="rgb(210 225 240 / 0.38)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
