export const overlayGlassCardClass =
  "rounded-2xl border border-white/10 bg-black/34 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.14)]";

export const metricGlassCardClass =
  "rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.14)] lg:bg-black/34";

export const desktopGlassCardClass = overlayGlassCardClass;

export const desktopMistIconClass =
  "border-white/14 bg-white/6 text-white/88";

export const desktopGoldIconClass =
  "border-karl-gold/22 bg-karl-gold/8 text-karl-gold";

export const desktopMetricIconFrameClass =
  "flex shrink-0 items-center justify-center rounded-full border lg:h-12 lg:w-12";

export const desktopInsightIconFrameClass =
  "flex shrink-0 items-center justify-center rounded-full border lg:h-14 lg:w-14";

export const desktopMetricIconSizeClass = "h-6 w-6 lg:h-7 lg:w-7";

export const desktopInsightIconSizeClass = "h-7 w-7 lg:h-8 lg:w-8";

export const desktopClickableCardLinkClass =
  "group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karl-gold";

export const desktopClickableCardHoverClass =
  "transition-colors group-hover:border-white/14 group-hover:bg-white/[0.03] motion-reduce:transition-none";

export function clearestSpotDesktopLabel(isNightPresentation: boolean): string {
  return isNightPresentation ? "Clearest Spot" : "Clearest Spot";
}
