"use client";

import { useEffect, useState } from "react";

const PHONE_PORTRAIT_QUERY = "(max-width: 639px) and (orientation: portrait)";

export function usePhonePortrait(): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(PHONE_PORTRAIT_QUERY);
    const update = () => setMatches(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return matches;
}

export function isPhonePortraitViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(PHONE_PORTRAIT_QUERY).matches;
}
