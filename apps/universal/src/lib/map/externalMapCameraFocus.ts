/**
 * Phone camera for an external `selected=` route.
 *
 * Favorite, Find Clear Skies, Best Right Now, location detail, and a direct
 * `/map?selected=` link update the card through the route. They are not marker
 * taps, search selections, or Organic Map, so they must focus once themselves.
 * Local route writes keep the camera they already own.
 */

export type ExternalMapFocusPoint = {
  id: string;
  latitude: number;
  longitude: number;
};

export function externalSelectedFocusId(input: {
  routeSource: 'local' | 'external';
  explicitSelectedId: string | null;
}): string | null {
  if (input.routeSource !== 'external') {
    return null;
  }

  return input.explicitSelectedId;
}

/**
 * Catalog row for a pending external focus, or null while that id is not
 * loaded yet. The caller keeps the pending id until this returns a row.
 */
export function resolvePendingExternalMapFocus<T extends ExternalMapFocusPoint>(
  pendingId: string | null,
  locations: readonly T[],
): T | null {
  if (!pendingId) {
    return null;
  }

  const match = locations.find((location) => location.id === pendingId);
  if (!match) {
    return null;
  }

  if (!Number.isFinite(match.latitude) || !Number.isFinite(match.longitude)) {
    return null;
  }

  return match;
}
