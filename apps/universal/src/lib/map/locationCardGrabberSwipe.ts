/**
 * Grabber swipe for the phone selected-location sheet.
 *
 * Matches the mobile-web grab handle (`DRAG_SNAP_THRESHOLD` in
 * apps/web/components/ui/BottomSheet.tsx): a vertical move of 28 points
 * snaps the existing expanded/collapsed detent. The sheet does not follow
 * the finger. Mostly horizontal movement is ignored.
 */

/** Distance (pt) a grabber drag must travel before it snaps the detent. */
export const PHONE_SHEET_GRABBER_SWIPE_THRESHOLD = 28;

export type LocationCardGrabberSwipeDecision = 'EXPAND' | 'COLLAPSE' | 'NONE';

/**
 * Interpret one finished grabber movement.
 *
 * Upward is negative `dy` (same sign as the web pointer delta). A move is
 * mostly horizontal when `|dx|` is strictly greater than `|dy|`.
 */
export function resolveLocationCardGrabberSwipe(
  dx: number,
  dy: number,
): LocationCardGrabberSwipeDecision {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
    return 'NONE';
  }

  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absX > absY || absY < PHONE_SHEET_GRABBER_SWIPE_THRESHOLD) {
    return 'NONE';
  }

  return dy < 0 ? 'EXPAND' : 'COLLAPSE';
}

/**
 * True when the grabber should take the touch so the trailing press cannot
 * also toggle. Includes a sideways drag past the threshold, which must not
 * expand, collapse, or fall through as a tap.
 */
export function locationCardGrabberShouldClaimSwipe(
  dx: number,
  dy: number,
): boolean {
  if (resolveLocationCardGrabberSwipe(dx, dy) !== 'NONE') {
    return true;
  }

  if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
    return false;
  }

  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  return absX > absY && absX >= PHONE_SHEET_GRABBER_SWIPE_THRESHOLD;
}

/**
 * Expanded flag after a resolved grabber swipe.
 * `NONE` leaves the current flag untouched.
 */
export function nextLocationCardExpanded(
  isExpanded: boolean,
  dx: number,
  dy: number,
): boolean {
  const decision = resolveLocationCardGrabberSwipe(dx, dy);
  if (decision === 'EXPAND') {
    return true;
  }
  if (decision === 'COLLAPSE') {
    return false;
  }
  return isExpanded;
}
