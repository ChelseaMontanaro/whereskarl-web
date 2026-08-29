/**
 * Vector bottom-navigation artwork for the Home and Map tabs only.
 *
 * Source of truth: mobile-web `NavIcon` (apps/web/components/layout/NavLinks.tsx).
 * The two paths below are copied verbatim from that component.
 *
 * Native draws all four tabs as Unicode text glyphs (⌂ ⌖ ♥ ⚙). Glyph artwork
 * occupies wildly different fractions of its em box per character: ♥ and ⚙ fill
 * theirs, while ⌂ and ⌖ draw roughly half as tall at the same font size, and ⌖
 * sits off the shared text baseline. That is why Home and Map read as too small
 * and misaligned next to Favorites and Settings on the physical iPhone.
 *
 * Only Home and Map are re-drawn as vectors. Favorites and Settings keep their
 * native ♥ / ⚙ glyphs — the mobile-web heart and gear are deliberately NOT used.
 */

/** Tabs whose artwork is drawn from vector paths rather than a text glyph. */
export type BottomNavVectorHref = '/' | '/map';

/**
 * Home / Map vector icon box.
 *
 * The path bounds (not the 24×24 viewBox) are what actually render, so a
 * bigger frame only helps in proportion to how much of it the artwork fills:
 *   '/'    bbox 18w × 17.6h of 24 → 75.0% × 73.3% fill
 *   '/map' bbox 18w × 16.0h of 24 → 75.0% × 66.7% fill
 * (both bboxes are centred in the viewBox, so `contentFit="contain"` scales
 * them evenly with no extra offset to correct for).
 *
 * Mobile-web ships a 20px (`h-5 w-5`) box, i.e. ~15×14.7 / 15×13.3 of actual
 * drawn ink. The native Favorites ♥ / Settings ⚙ glyphs draw much closer to
 * their full 18pt font-size box. A first pass raised this constant to 26
 * (~19.5×19.1 / 19.5×17.3 ink), which physical-iPhone QA still read as one
 * size smaller than the glyphs. Raised again to 32 — the same slot already
 * approved for Home's informational icons (`METRIC_ICON_SIZE`) — for
 * ~24×23.5 / 24×21.3 of drawn ink, closing the remaining gap.
 */
export const BOTTOM_NAV_ICON_SIZE = 32;

/** Verbatim mobile-web `NavIcon` paths, drawn in a 24×24 viewBox. */
const BOTTOM_NAV_ICON_PATH: Record<BottomNavVectorHref, string> = {
  '/': 'M12 3.2 3 11v9.8h6.5V15H14.5v5.8H21V11L12 3.2Z',
  '/map': 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 2.2 6 2V17.8l-6-2V6.2Z',
};

export function isBottomNavVectorHref(
  href: string,
): href is BottomNavVectorHref {
  return href === '/' || href === '/map';
}

export function bottomNavIconSvg(
  href: BottomNavVectorHref,
  color: string,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="${color}"><path d="${BOTTOM_NAV_ICON_PATH[href]}"/></svg>`;
}

/** Data URI for expo-image — `color` is baked in so no tinting is required. */
export function bottomNavIconDataUri(
  href: BottomNavVectorHref,
  color: string,
): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    bottomNavIconSvg(href, color),
  )}`;
}
