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
      <ellipse cx="16" cy="11.5" rx="10" ry="6.5" fill="#C5DDF0" />
      <ellipse cx="9.5" cy="12.5" rx="5" ry="4.5" fill="#E8F3FA" />
      <ellipse cx="22.5" cy="12.5" rx="5" ry="4.5" fill="#E8F3FA" />
      <ellipse cx="16" cy="9.5" rx="7" ry="4.5" fill="#F2F8FC" />
      <circle cx="12.5" cy="11" r="1.15" fill="#162636" />
      <circle cx="19.5" cy="11" r="1.15" fill="#162636" />
      <circle cx="12.9" cy="10.6" r="0.35" fill="#F2F8FC" />
      <circle cx="19.9" cy="10.6" r="0.35" fill="#F2F8FC" />
      <path
        d="M12.5 13.8c1.1 1 2.2 1.4 3.5 1.4s2.4-.4 3.5-1.4"
        stroke="#162636"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M4.5 19c2 0 3.1-1 4-1.7.9.7 2 1.7 4 1.7s3.1-1 4-1.7c.9.7 2 1.7 4 1.7s3.1-1 4-1.7c.9.7 2 1.7 4 1.7"
        stroke="#93B8D8"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M6 22.5c1.5 0 2.3-.75 3-1.45.7.7 1.5 1.45 3 1.45s2.3-.75 3-1.45c.7.7 1.5 1.45 3 1.45s2.3-.75 3-1.45c.7.7 1.5 1.45 3 1.45"
        stroke="#B8D4EA"
        strokeWidth="1.05"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}
