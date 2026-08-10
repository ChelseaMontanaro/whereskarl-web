"use client";

import { useEffect } from "react";

/**
 * Shared Escape-to-dismiss policy for map chrome (selected location, layers
 * sheet). Presentation-only — does not own selection or routing state.
 */
export function useEscapeToDismiss(
  enabled: boolean,
  onDismiss: (() => void) | undefined,
): void {
  useEffect(() => {
    if (!enabled || !onDismiss) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onDismiss]);
}
