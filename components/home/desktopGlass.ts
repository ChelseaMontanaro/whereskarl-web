export const desktopGlassCardClass =
  "rounded-2xl border border-white/10 bg-black/58 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-karl-gold/10";

export const desktopMistIconClass =
  "border-white/12 bg-black/35 ring-1 ring-white/10";

export const desktopGoldIconClass =
  "border-karl-gold/24 bg-black/35 ring-1 ring-karl-gold/14";

export const desktopMetricIconFrameClass =
  "flex shrink-0 items-center justify-center rounded-2xl border lg:h-[3.75rem] lg:w-[3.75rem]";

export const desktopInsightIconFrameClass =
  "flex shrink-0 items-center justify-center rounded-2xl border lg:h-[4.25rem] lg:w-[4.25rem]";

export const desktopMetricIconSizeClass = "h-9 w-9 lg:h-11 lg:w-11";

export const desktopInsightIconSizeClass = "h-10 w-10 lg:h-12 lg:w-12";

export function clearestSpotDesktopLabel(isNightPresentation: boolean): string {
  return isNightPresentation ? "Clearest Spot" : "Clearest Spot";
}
