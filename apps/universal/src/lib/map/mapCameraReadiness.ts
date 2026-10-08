/**
 * Phone camera sequencing for a focus that arrives before native map readiness.
 *
 * Organic Map focuses after `onMapReady`, so its `animateToRegion` wins.
 * An explicit destination can call `focusLocation` first. That request stays
 * here until the ready callback applies the existing all-Bay fit and only
 * then the same location focus. The latest valid request replaces an earlier
 * one. An invalid coordinate does not erase a request already held.
 */

export type RememberedMapFocus = {
  latitude: number;
  longitude: number;
};

export function rememberPreReadyMapFocus(
  current: RememberedMapFocus | null,
  latitude: number,
  longitude: number,
): RememberedMapFocus | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return current;
  }

  return { latitude, longitude };
}

export type MapReadyCameraStep =
  | { type: 'all-bay' }
  | { type: 'focus'; latitude: number; longitude: number };

/**
 * Ready-callback order. The all-Bay fit is always first. A remembered focus
 * is second, and only when one exists.
 */
export function cameraStepsOnMapReady(
  pending: RememberedMapFocus | null,
): readonly MapReadyCameraStep[] {
  if (!pending) {
    return [{ type: 'all-bay' }];
  }

  return [
    { type: 'all-bay' },
    {
      type: 'focus',
      latitude: pending.latitude,
      longitude: pending.longitude,
    },
  ];
}
