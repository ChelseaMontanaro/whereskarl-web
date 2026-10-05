export type MapSearchKeyboardDismissal = {
  query: string;
  isOverlayOpen: false;
  submitted: false;
  cleared: false;
  selectionChanged: false;
};

/**
 * A map tap ends the keyboard session only. The typed query stays, and the
 * tap is not a search submit or a location-selection change.
 */
export function dismissMapSearchFromMapTap(
  query: string,
): MapSearchKeyboardDismissal {
  return {
    query,
    isOverlayOpen: false,
    submitted: false,
    cleared: false,
    selectionChanged: false,
  };
}
