import { HERO_CDN_BASE } from "@/lib/home/heroAssets";

/**
 * Existing approved daytime Bay Area hero photographs on the product CDN.
 * Paths can be swapped later without changing the page structure.
 * They are not the generated mockup photographs.
 */
export const MARKETING_HERO_PHOTO = `${HERO_CDN_BASE}/hero/baker-beach/day.png`;

export const MARKETING_SCENIC_PHOTO = `${HERO_CDN_BASE}/hero/crissy-field/Day.png`;

/**
 * map-overview-hero.png is 296px wide and its rightmost column is white,
 * not app UI. This scale keeps that column, plus a 0.25px resample buffer,
 * outside the hero screen clip. The phone frame's layout size is unchanged.
 */
export const HERO_MAP_SCREEN_SCALE = 296 / 294.75;

/**
 * home-overview.png is 293px wide. Its rightmost column is no longer pure
 * white, but on the dark UI it is still an anti-aliased blend of the white
 * column removed in Phase 31.18. The border-box screen is 155.2px or 135.2px
 * wide, so that one source column is about 0.5 CSS px and 1–2 device pixels,
 * and 155.2 × 3 = 465.6 is not an integer device-pixel width. This scale
 * keeps that blended column, plus a 0.25px resample buffer, outside the home
 * screen clip. The phone frame's layout size is unchanged.
 */
export const HOME_OVERVIEW_SCREEN_SCALE = 293 / 291.75;

export const MARKETING_SCREENSHOTS = {
  heroMap: "/marketing/screenshots/map-overview-hero.png",
  middleMap: "/marketing/screenshots/map-overview-middle.png",
  homeOverview: "/marketing/screenshots/home-overview.png",
  millValley: "/marketing/screenshots/mill-valley-details.png",
  favorites: "/marketing/screenshots/favorites.png",
} as const;
