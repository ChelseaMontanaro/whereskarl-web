type IconProps = {
  className?: string;
};

const MIST_LIGHT = "#E8F3FA";
const MIST_MID = "#C5DDF0";
const MIST_DEEP = "#93B8D8";
const GOLD_CORE = "#F2A326";
const GOLD_RAY = "#FFC857";
const GOLD_DEEP = "#C87A14";
const MOON_BLUE = "#7EB3D8";
const MOON_LIGHT = "#A5CCE8";
const STAR_BLUE = "#D4E8F8";

function IllustratedFogCoverage({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} fill="none">
      <ellipse cx="24" cy="20" rx="14" ry="8.5" fill={MIST_MID} opacity="0.95" />
      <ellipse cx="15" cy="22" rx="8" ry="6" fill={MIST_LIGHT} />
      <ellipse cx="33" cy="22" rx="8" ry="6" fill={MIST_LIGHT} />
      <ellipse cx="24" cy="17" rx="10" ry="6.5" fill={MIST_LIGHT} />
      <path
        d="M8 30c2.8 0 4.3-1.2 5.6-2.2 1.2 1 2.8 2.2 5.6 2.2s4.4-1.2 5.6-2.2c1.2 1 2.8 2.2 5.6 2.2s4.4-1.2 5.6-2.2c1.2 1 2.8 2.2 5.6 2.2"
        stroke={MIST_DEEP}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M10 35.5c2.2 0 3.4-1 4.4-1.8.9.8 2.1 1.8 4.4 1.8s3.5-1 4.4-1.8c.9.8 2.1 1.8 4.4 1.8s3.5-1 4.4-1.8c.9.8 2.1 1.8 4.4 1.8"
        stroke={MIST_MID}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

function IllustratedKarlFog({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} fill="none">
      <ellipse cx="24" cy="19" rx="13" ry="8.5" fill={MIST_MID} />
      <ellipse cx="16" cy="21" rx="7" ry="5.5" fill={MIST_LIGHT} />
      <ellipse cx="32" cy="21" rx="7" ry="5.5" fill={MIST_LIGHT} />
      <ellipse cx="24" cy="16.5" rx="9.5" ry="6" fill={MIST_LIGHT} />
      <circle cx="19.5" cy="17.5" r="1.5" fill="#1A3044" />
      <circle cx="28.5" cy="17.5" r="1.5" fill="#1A3044" />
      <path
        d="M19.5 22c1.6 1.4 3.2 2 4.5 2s2.9-.6 4.5-2"
        stroke="#1A3044"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M9 29.5c2.6 0 4-1.1 5.2-2 .9 1 2.3 2 5.2 2s4.3-1 5.2-2c.9 1 2.3 2 5.2 2s4.3-1 5.2-2c.9 1 2.3 2 5.2 2"
        stroke={MIST_DEEP}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M11 34.5c2 0 3.1-.9 4-1.7.8.8 1.9 1.7 4 1.7s3.2-.9 4-1.7c.8.8 1.9 1.7 4 1.7s3.2-.9 4-1.7c.8.8 1.9 1.7 4 1.7"
        stroke={MIST_MID}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

function IllustratedSun({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} fill="none">
      <circle cx="24" cy="24" r="9" fill={GOLD_CORE} />
      <circle cx="24" cy="24" r="6.5" fill={GOLD_RAY} opacity="0.85" />
      {[
        [24, 6],
        [24, 42],
        [6, 24],
        [42, 24],
        [11.2, 11.2],
        [36.8, 11.2],
        [11.2, 36.8],
        [36.8, 36.8],
      ].map(([cx, cy], index) => (
        <ellipse
          key={index}
          cx={cx}
          cy={cy}
          rx={cx === 24 ? 2.8 : 2.4}
          ry={cy === 24 ? 2.8 : 2.4}
          fill={GOLD_RAY}
        />
      ))}
      <circle cx="24" cy="24" r="4.5" fill={GOLD_DEEP} opacity="0.35" />
    </svg>
  );
}

function IllustratedMoonStar({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} fill="none">
      <path
        d="M28 10.5a11 11 0 1 0 9.5 16.5A13.5 13.5 0 0 1 28 10.5Z"
        fill={MOON_BLUE}
      />
      <path
        d="M30 13.5a8 8 0 1 0 6.8 12.2A10.5 10.5 0 0 1 30 13.5Z"
        fill={MOON_LIGHT}
        opacity="0.45"
      />
      <path
        d="M14 14.5 15.2 17.8 18.6 18.8 15.2 19.8 14 23 12.8 19.8 9.4 18.8 12.8 17.8 14 14.5Z"
        fill={STAR_BLUE}
      />
    </svg>
  );
}

export function FogCoverageIcon({ className = "h-5 w-5" }: IconProps) {
  return <IllustratedFogCoverage className={className} />;
}

export function KarlStatusIcon({ className = "h-5 w-5" }: IconProps) {
  return <IllustratedKarlFog className={className} />;
}

export function SunshineIcon({ className = "h-5 w-5" }: IconProps) {
  return <IllustratedSun className={className} />;
}

export function MoonIcon({ className = "h-5 w-5" }: IconProps) {
  return <IllustratedMoonStar className={className} />;
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

export {
  IllustratedFogCoverage,
  IllustratedKarlFog,
  IllustratedMoonStar,
  IllustratedSun,
};
