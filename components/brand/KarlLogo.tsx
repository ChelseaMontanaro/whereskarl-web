type KarlLogoProps = {
  className?: string;
};

export function KarlLogo({ className = "h-8 w-8" }: KarlLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <ellipse cx="16" cy="12.5" rx="9" ry="6" fill="#C5DDF0" />
      <ellipse cx="10.5" cy="13.5" rx="4.5" ry="4" fill="#E8F3FA" />
      <ellipse cx="21.5" cy="13.5" rx="4.5" ry="4" fill="#E8F3FA" />
      <ellipse cx="16" cy="10.5" rx="6.5" ry="4" fill="#F2F8FC" />
      <circle cx="13" cy="11.5" r="1" fill="#162636" />
      <circle cx="19" cy="11.5" r="1" fill="#162636" />
      <path
        d="M13 14c1 0.9 2 1.3 3 1.3s2-.4 3-1.3"
        stroke="#162636"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M5.5 19.5c1.8 0 2.8-.9 3.6-1.6.8.7 1.8 1.6 3.6 1.6s2.8-.9 3.6-1.6c.8.7 1.8 1.6 3.6 1.6s2.8-.9 3.6-1.6c.8.7 1.8 1.6 3.6 1.6"
        stroke="#93B8D8"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M7 22.5c1.4 0 2.2-.7 2.9-1.4.7.7 1.5 1.4 2.9 1.4s2.2-.7 2.9-1.4c.7.7 1.5 1.4 2.9 1.4s2.2-.7 2.9-1.4c.7.7 1.5 1.4 2.9 1.4"
        stroke="#B8D4EA"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
