export const desktopGlassCardClass =
  "rounded-2xl border border-white/10 bg-black/34 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.14)]";

export const desktopMistIconClass =
  "border-white/14 bg-white/6 text-white/88";

export const desktopGoldIconClass =
  "border-karl-gold/22 bg-karl-gold/8 text-karl-gold";

export const desktopMetricIconFrameClass =
  "flex shrink-0 items-center justify-center rounded-full border lg:h-12 lg:w-12";

export const desktopInsightIconFrameClass =
  "flex shrink-0 items-center justify-center rounded-full border lg:h-14 lg:w-14";

export const desktopMetricIconSizeClass = "h-5 w-5 lg:h-6 lg:w-6";

export const desktopInsightIconSizeClass = "h-6 w-6 lg:h-7 lg:w-7";

export function clearestSpotDesktopLabel(isNightPresentation: boolean): string {
  return isNightPresentation ? "Clearest Spot" : "Clearest Spot";
}
