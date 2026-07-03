type KarlLogoProps = {
  className?: string;
};

export function KarlLogo({ className = "h-11 w-11" }: KarlLogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <ellipse cx="24" cy="18.5" rx="14" ry="9" fill="#C5DDF0" />
      <ellipse cx="15.5" cy="20.5" rx="7.5" ry="6" fill="#E8F3FA" />
      <ellipse cx="32.5" cy="20.5" rx="7.5" ry="6" fill="#E8F3FA" />
      <ellipse cx="24" cy="15.5" rx="10.5" ry="6.5" fill="#F2F8FC" />
      <circle cx="19" cy="16.5" r="1.6" fill="#162636" />
      <circle cx="29" cy="16.5" r="1.6" fill="#162636" />
      <path
        d="M19 21c1.7 1.5 3.3 2.2 5 2.2s3.3-.7 5-2.2"
        stroke="#162636"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.78"
      />
      <path
        d="M8 29.5c2.8 0 4.3-1.2 5.6-2.2 1.2 1 2.8 2.2 5.6 2.2s4.4-1.2 5.6-2.2c1.2 1 2.8 2.2 5.6 2.2s4.4-1.2 5.6-2.2c1.2 1 2.8 2.2 5.6 2.2"
        stroke="#93B8D8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M10 34.5c2.2 0 3.4-1 4.4-1.8.9.8 2.1 1.8 4.4 1.8s3.5-1 4.4-1.8c.9.8 2.1 1.8 4.4 1.8s3.5-1 4.4-1.8c.9.8 2.1 1.8 4.4 1.8"
        stroke="#B8D4EA"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M12 38.5c1.8 0 2.8-.8 3.6-1.5.8.7 1.8 1.5 3.6 1.5s2.8-.8 3.6-1.5c.8.7 1.8 1.5 3.6 1.5s2.8-.8 3.6-1.5c.8.7 1.8 1.5 3.6 1.5"
        stroke="#C5DDF0"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
