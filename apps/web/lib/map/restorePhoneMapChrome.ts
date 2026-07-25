/**
 * Restore phone-portrait map chrome after search/keyboard interaction.
 *
 * Confirmed root cause (phone `/map`):
 * - The map host intentionally uses `overflow-hidden`, so `window.scrollY`
 *   stays `0` and is not a useful signal.
 * - After the soft keyboard dismisses, iOS Safari can leave
 *   `visualViewport.offsetTop` (and sometimes `offsetLeft`) temporarily
 *   non-zero even though the document never scrolled.
 * - Fixed bottom navigation then paints relative to that shifted visual
 *   viewport and appears missing. The shared `BottomSheet` is unchanged but
 *   looks taller because it is no longer paired with visible bottom chrome.
 *
 * Restoration is therefore driven by whether the keyboard/search session has
 * ended (focus + viewport height), then actively clears a residual visual
 * viewport offset. It does not use CSS padding/transforms, sheet sizing, or
 * timer-based restoration.
 */

function isTextEntryElement(
  element: Element | null,
): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  if (element instanceof HTMLInputElement) {
    return (
      element.type !== "button" &&
      element.type !== "submit" &&
      element.type !== "reset" &&
      element.type !== "checkbox" &&
      element.type !== "radio"
    );
  }
  return (
    element instanceof HTMLTextAreaElement || element.isContentEditable
  );
}

/** Soft keyboard still compressing the visual viewport height. */
export function isPhoneMapKeyboardLikelyOpen(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const visualViewport = window.visualViewport;
  if (!visualViewport) {
    return false;
  }

  return window.innerHeight - visualViewport.height > 40;
}

/**
 * Search/keyboard interaction is still active: text focus, open results
 * overlay, or a compressed visual viewport (keyboard visible).
 *
 * A non-zero `offsetTop` alone does NOT mean the session is active — that is
 * the stale-offset bug this module clears after the session ends.
 */
export function isPhoneMapSearchKeyboardSessionActive(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (isTextEntryElement(document.activeElement)) {
    return true;
  }

  if (
    document.querySelector('[data-testid="map-phone-portrait-search-results"]')
  ) {
    return true;
  }

  return isPhoneMapKeyboardLikelyOpen();
}

/** Residual Safari visual-viewport shift with no live keyboard compression. */
export function hasStaleVisualViewportOffset(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const visualViewport = window.visualViewport;
  if (!visualViewport) {
    return false;
  }

  if (isPhoneMapKeyboardLikelyOpen()) {
    return false;
  }

  return visualViewport.offsetTop !== 0 || visualViewport.offsetLeft !== 0;
}

/**
 * Clear a residual visualViewport offset without depending on `scrollY`.
 *
 * Classic iOS pattern: nudge the window to the residual offset, then return to
 * the origin. Only invoked when `hasStaleVisualViewportOffset()` is true — on
 * Desktop/Android/settled Safari (offsets already 0) this path is never taken.
 */
function clearStaleVisualViewportOffset(): void {
  const visualViewport = window.visualViewport;
  if (!visualViewport) {
    return;
  }

  const { offsetTop, offsetLeft } = visualViewport;
  if (offsetTop === 0 && offsetLeft === 0) {
    return;
  }

  window.scrollTo(offsetLeft, offsetTop);
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const mapRoot = document.querySelector<HTMLElement>(
    "[data-karl-phone-map-root]",
  );
  if (mapRoot) {
    mapRoot.scrollTop = 0;
    mapRoot.scrollLeft = 0;
  }
}

/**
 * End-of-session chrome restore: blur any text entry, then clear a stale
 * visual-viewport offset so fixed bottom navigation returns to the normal
 * layout bottom.
 *
 * Idempotent: when the viewport is already settled (no text focus, no residual
 * offset), this is a no-op and performs no window scroll.
 */
export function restorePhoneMapChrome(): void {
  if (typeof window === "undefined") {
    return;
  }

  const active = document.activeElement;
  if (isTextEntryElement(active)) {
    active.blur();
  }

  if (hasStaleVisualViewportOffset()) {
    clearStaleVisualViewportOffset();
  }
}

/**
 * Subscribe to visualViewport resize/scroll. When the search/keyboard session
 * has ended, clear any residual offsetTop/offsetLeft so chrome is not left
 * shifted. Cleans up listeners on unsubscribe.
 */
export function subscribePhoneMapChromeViewportRecovery(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const visualViewport = window.visualViewport;
  if (!visualViewport) {
    return () => {};
  }

  let lastHeight = visualViewport.height;

  const onViewportChange = () => {
    const nextHeight = visualViewport.height;
    const heightGrew = nextHeight > lastHeight + 40;
    lastHeight = nextHeight;

    // Typing / keyboard still open: do not fight Safari mid-session.
    if (isPhoneMapSearchKeyboardSessionActive()) {
      return;
    }

    // Session ended with a residual offset (often after height recovery).
    if (heightGrew || hasStaleVisualViewportOffset()) {
      if (hasStaleVisualViewportOffset()) {
        clearStaleVisualViewportOffset();
      }
    }
  };

  visualViewport.addEventListener("resize", onViewportChange);
  visualViewport.addEventListener("scroll", onViewportChange);

  return () => {
    visualViewport.removeEventListener("resize", onViewportChange);
    visualViewport.removeEventListener("scroll", onViewportChange);
    if (
      !isPhoneMapSearchKeyboardSessionActive() &&
      hasStaleVisualViewportOffset()
    ) {
      clearStaleVisualViewportOffset();
    }
  };
}
