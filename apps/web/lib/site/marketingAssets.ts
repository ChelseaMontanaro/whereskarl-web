import { HERO_CDN_BASE } from "@/lib/home/heroAssets";

/**
 * Existing approved daytime Bay Area hero photographs on the product CDN.
 * Paths can be swapped later without changing the page structure.
 * They are not the generated mockup photographs.
 */
export const MARKETING_HERO_PHOTO = `${HERO_CDN_BASE}/hero/baker-beach/day.png`;

export const MARKETING_SCENIC_PHOTO = `${HERO_CDN_BASE}/hero/crissy-field/Day.png`;

export const MARKETING_SCREENSHOTS = {
  heroMap: "/marketing/screenshots/map-overview-hero.png",
  middleMap: "/marketing/screenshots/map-overview-middle.png",
  homeOverview: "/marketing/screenshots/home-overview.png",
  millValley: "/marketing/screenshots/mill-valley-details.png",
  favorites: "/marketing/screenshots/favorites.png",
} as const;
