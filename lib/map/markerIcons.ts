import type { FogIntensity } from "@/lib/map/conditions";

const SUN_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-map-marker__svg">
  <circle cx="12" cy="12" r="4.1" fill="currentColor" opacity="0.95" />
  <path d="M12 4.25v2.1M12 17.65v2.1M4.25 12h2.1M17.65 12h2.1M6.55 6.55l1.48 1.48M16.97 16.97l1.48 1.48M6.55 17.45l1.48-1.48M16.97 7.03l1.48-1.48" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" opacity="0.92" />
</svg>`;

const LIGHT_FOG_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-map-marker__svg">
  <ellipse cx="12" cy="10.5" rx="6.5" ry="4.2" fill="#C5DDF0" />
  <ellipse cx="7.5" cy="11.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="16.5" cy="11.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="12" cy="9" rx="4.8" ry="3" fill="#F2F8FC" />
</svg>`;

const FOG_COVERAGE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" class="karl-map-marker__svg">
  <ellipse cx="12" cy="9.5" rx="6.5" ry="4.2" fill="#C5DDF0" />
  <ellipse cx="7.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="16.5" cy="10.5" rx="3.8" ry="3.2" fill="#E8F3FA" />
  <ellipse cx="12" cy="8" rx="4.8" ry="3" fill="#F2F8FC" />
  <path d="M4 16.5c1.5 0 2.4-.85 3.1-1.55.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55s2.4-.85 3.1-1.55c.7.7 1.6 1.55 3.1 1.55" stroke="#93B8D8" stroke-width="1.2" stroke-linecap="round" opacity="0.88" />
  <path d="M6 19.5c1.1 0 1.7-.55 2.2-1.05.5.5 1.1 1.05 2.2 1.05s1.7-.55 2.2-1.05c.5.5 1.1 1.05 2.2 1.05s1.7-.55 2.2-1.05c.5.5 1.1 1.05 2.2 1.05" stroke="#B8D4EA" stroke-width="1" stroke-linecap="round" opacity="0.62" />
</svg>`;

export function getMarkerIconMarkup(
  intensity: FogIntensity | "neutral",
): string {
  switch (intensity) {
    case "clear":
    case "neutral":
      return SUN_ICON;
    case "lightFog":
      return LIGHT_FOG_ICON;
    case "foggy":
    case "karlTerritory":
      return FOG_COVERAGE_ICON;
  }
}
