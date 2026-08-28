/**
 * Home insight icon SVG markup (Best Right Now, Next Hour, etc.).
 * Dashboard metric cards use `homeMetricIcons` + Map phone-portrait artwork.
 */

const FOG_COVERAGE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
  <ellipse cx="12" cy="9.5" rx="6.5" ry="4.2" fill="#C5DDF0" />
  <ellipse cx="7.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="16.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="12" cy="8" rx="4.8" ry="3" fill="#F2F8FC" />
  <path d="M4 16.5c1.5 0 2.4-.85 3.1-1.55.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55" stroke="#93B8D8" stroke-width="1.2" stroke-linecap="round" opacity="0.88" />
  <path d="M6 19.5c1.1 0 1.7-.55 2.2-1.05.5.5 1.1 1.05 2.2 1.05s1.7-.55 2.2-1.05c.5.5 1.1 1.05 2.2 1.05s1.7-.55 2.2-1.05c.5.5 1.1 1.05 2.2 1.05" stroke="#B8D4EA" stroke-width="1" stroke-linecap="round" opacity="0.62" />
</svg>`;

function sunshineIconSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
  <circle cx="12" cy="12" r="4.1" fill="${color}" opacity="0.95" />
  <path d="M12 4.25v2.1M12 17.65v2.1M4.25 12h2.1M17.65 12h2.1M6.55 6.55l1.48 1.48M16.97 16.97l1.48 1.48M6.55 17.45l1.48-1.48M16.97 7.03l1.48-1.48" stroke="${color}" stroke-width="1.35" stroke-linecap="round" opacity="0.92" />
</svg>`;
}

const MOON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
  <path d="M16.2 5.1a7.4 7.4 0 1 0 6.4 11.1A9.2 9.2 0 0 1 16.2 5.1Z" fill="#8CB8D8" opacity="0.95" />
  <path d="M6.4 7.4 7.1 9.6 9.3 10.3 7.1 11 6.4 13.2 5.7 11 3.5 10.3 5.7 9.6 6.4 7.4Z" fill="#C5DDF0" opacity="0.9" />
</svg>`;

function nextHourIconSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
  <circle cx="12" cy="12" r="7.25" stroke="${color}" stroke-width="1.35" opacity="0.92" />
  <path d="M12 7.5v4.75l3.1 2.1" stroke="${color}" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M12 4.25v1.35M12 18.4v1.35" stroke="${color}" stroke-width="1.1" stroke-linecap="round" opacity="0.55" />
</svg>`;
}

function toDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const HOME_FOG_COVERAGE_ICON_URI = toDataUri(FOG_COVERAGE_ICON);
export const HOME_SUNSHINE_ICON_URI = toDataUri(sunshineIconSvg('#F2A326'));
export const HOME_SUNSHINE_WHITE_ICON_URI = toDataUri(
  sunshineIconSvg('rgba(255,255,255,0.92)'),
);
export const HOME_MOON_ICON_URI = toDataUri(MOON_ICON);
export const HOME_NEXT_HOUR_ICON_URI = toDataUri(
  nextHourIconSvg('rgba(255,255,255,0.88)'),
);
