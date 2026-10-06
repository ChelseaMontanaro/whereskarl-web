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

/**
 * iOS can deliver one TextInput focus event after a map-tap blur. That event
 * must not reopen the dropdown. A later press on the field clears the latch
 * before its own focus, so a real tap can show results again.
 */
export function consumeSearchFocus(input: {
  ignorePendingDismissFocus: boolean;
  fromFieldPress: boolean;
}): { openOverlay: boolean; ignorePendingDismissFocus: boolean } {
  if (input.fromFieldPress || input.ignorePendingDismissFocus) {
    return {
      openOverlay: false,
      ignorePendingDismissFocus: false,
    };
  }

  return {
    openOverlay: true,
    ignorePendingDismissFocus: false,
  };
}
