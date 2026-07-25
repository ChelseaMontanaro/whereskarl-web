"use client";

import { useEffect, useState } from "react";

export function useMinWidth(minWidthPx: number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${minWidthPx}px)`);
    const update = () => setMatches(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, [minWidthPx]);

  return matches;
}
