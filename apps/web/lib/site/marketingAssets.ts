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

export const MARKETING_SCREENSHOTS = {
  heroMap: "/marketing/screenshots/map-overview-hero.png",
  middleMap: "/marketing/screenshots/map-overview-middle.png",
  homeOverview: "/marketing/screenshots/home-overview.png",
  millValley: "/marketing/screenshots/mill-valley-details.png",
  favorites: "/marketing/screenshots/favorites.png",
} as const;
