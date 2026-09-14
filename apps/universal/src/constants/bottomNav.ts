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

/** Phone map floating chrome offset above the bottom nav (web 4.75rem). */
export const BOTTOM_NAV_MAP_PHONE_OFFSET = 76;
