/**
 * Phone selected-location sheet vertical layout.
 *
 * The expanded body previously used a hardcoded `maxHeight: 320`, which left
 * the canonical tail of the sheet (Karl's Read and Hourly Outlook) below an
 * effectively unreachable fold on a physical iPhone. Height is now derived
 * from viewport height and safe-area insets — never from a device model, and
 * never by dropping content to fit.
 */

import { BOTTOM_NAV_MAP_PHONE_OFFSET } from '@/constants/bottomNav';

/**
 * Vertical space the collapsed peek occupies (identity row + Core Weather
 * strip + expand affordance). Reserved so the expanded sheet cannot grow past
 * the top safe area.
 */
export const PHONE_SHEET_PEEK_ALLOWANCE = 168;

/** Share of viewport height the expanded body may occupy (web: `62dvh`). */
export const PHONE_SHEET_EXPANDED_VIEWPORT_RATIO = 0.62;

/** Breathing room between the sheet top edge and the chrome above it. */
export const PHONE_SHEET_TOP_GUTTER = 8;

/**
 * The peek grows with the OS text-size setting, so the reserved allowance has
 * to grow with it too — otherwise an enlarged-text device would be handed an
 * over-generous scroll body and push its own header off the top of the screen.
 * This scales by measured text metrics, never by device model.
 */
export function resolvePhoneSheetPeekAllowance(fontScale = 1): number {
  return Math.round(
    PHONE_SHEET_PEEK_ALLOWANCE * Math.max(1, Number.isFinite(fontScale) ? fontScale : 1),
  );
}

/**
 * Max height for the expanded scroll body.
 *
 * Content is never removed — a shorter viewport (or a larger text size) simply
 * scrolls more. Available space always wins over the preferred ratio, so the
 * peek header and its dismiss control can never be pushed off the top of the
 * screen in order to show more body.
 */
export function resolvePhoneSheetExpandedMaxHeight(
  viewportHeight: number,
  topInset: number,
  bottomInset: number,
  fontScale = 1,
): number {
  const preferred = Math.round(
    viewportHeight * PHONE_SHEET_EXPANDED_VIEWPORT_RATIO,
  );
  const available =
    viewportHeight -
    topInset -
    bottomInset -
    BOTTOM_NAV_MAP_PHONE_OFFSET -
    resolvePhoneSheetPeekAllowance(fontScale) -
    PHONE_SHEET_TOP_GUTTER;

  return Math.max(0, Math.min(preferred, available));
}

/**
 * True when the expanded sheet stays inside the usable viewport — i.e. the
 * peek, the scroll body, the nav offset, and both safe areas all fit.
 */
export function phoneSheetFitsViewport(
  viewportHeight: number,
  topInset: number,
  bottomInset: number,
  fontScale = 1,
): boolean {
  const expanded = resolvePhoneSheetExpandedMaxHeight(
    viewportHeight,
    topInset,
    bottomInset,
    fontScale,
  );
  const total =
    expanded +
    resolvePhoneSheetPeekAllowance(fontScale) +
    BOTTOM_NAV_MAP_PHONE_OFFSET +
    topInset +
    bottomInset;

  return total <= viewportHeight;
}

/**
 * Delay before the collapsed sheet starts accepting surface taps as an expand
 * gesture. Mirrors the mobile-web card, which arms `expandOnSurfaceTap` 400ms
 * after mount so the marker/search tap that opened the sheet cannot fall
 * through and expand it immediately.
 */
export const PHONE_SHEET_SURFACE_TAP_ARM_DELAY_MS = 400;

/**
 * Upper bound on Dynamic Type growth for the collapsed card's fixed-geometry
 * labels (Core Weather titles, subtitle/timestamp). The web reference sizes
 * these in fixed CSS px and is explicitly tuned so the long "Clear Sky Score"
 * title fits at 390px, so unbounded iOS scaling is what truncated them.
 */
export const PHONE_SHEET_LABEL_MAX_FONT_SCALE = 1.1;
