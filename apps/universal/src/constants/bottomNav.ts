/**
 * Shared bottom navigation dimensions for tab screens (Home, Map, Favorites, Settings).
 *
 * Source of truth: current mobile-web BottomNav (apps/web AppShell + NavLinks).
 * Web clearance tokens: home ~4.25rem, map sheet ~4.75rem (+ safe-area).
 */

/** Visual height of the bottom nav bar excluding the device safe-area inset. */
export const BOTTOM_NAV_BAR_HEIGHT = 68;

/** Scroll/content padding so tab screens clear the floating bottom nav. */
export const BOTTOM_NAV_SCROLL_INSET = BOTTOM_NAV_BAR_HEIGHT;

/**
 * Phone map card offset above BottomNav, excluding the safe-area inset.
 * Native bar content is about 74pt (8 + 16 + 32 icon + 4 + 14 label).
 * 86 leaves about a 12pt gap. The map screen adds the safe area itself.
 * Home scroll inset stays on BOTTOM_NAV_BAR_HEIGHT.
 */
export const BOTTOM_NAV_MAP_PHONE_OFFSET = 86;
