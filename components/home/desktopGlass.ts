export const overlayGlassCardClass =
  "rounded-2xl border border-white/10 bg-black/34 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.14)]";

export const metricGlassCardClass =
  "rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.14)] lg:bg-black/34";

export const insightGlassCardClass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-black/26 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.12)] max-sm:border-white/12 max-sm:bg-black/30 max-sm:backdrop-blur-lg max-sm:shadow-[0_6px_28px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] sm:bg-black/34";

export const mobileInsightGlassHighlightClass =
  "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] via-transparent to-black/14 max-sm:block sm:hidden";

/** Phone portrait (max-sm) metric tile sizing — tablet/desktop unchanged */
export const mobileMetricCardSurfaceClass =
  "max-sm:min-h-[7.25rem] max-sm:px-4 max-sm:py-4";

/** Phone portrait insight card padding/gap — used below lg only */
export const mobileInsightCardSurfaceClass =
  "max-sm:gap-4 max-sm:px-5 max-sm:py-5";

export const mobileCardLabelClass =
  "max-sm:text-[0.6875rem] max-sm:tracking-[0.13em] max-sm:text-white/42";

export const mobileInsightIconFrameClass = "max-sm:h-14 max-sm:w-14";

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
