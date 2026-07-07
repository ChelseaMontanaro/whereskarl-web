export const overlayGlassCardClass =
  "rounded-2xl border border-white/10 bg-black/34 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.14)]";

export const metricGlassCardClass =
  "rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.14)] lg:bg-black/34";

export const insightGlassCardClass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-black/26 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.12)] max-sm:border-white/12 max-sm:bg-black/30 max-sm:backdrop-blur-lg max-sm:shadow-[0_6px_28px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] sm:bg-black/34";

export const mobileInsightGlassHighlightClass =
  "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] via-transparent to-black/14 max-sm:block sm:hidden";

/** Phone portrait (max-sm) metric tile sizing — fixed height for stable grid rows */
export const mobileMetricCardSurfaceClass =
  "max-sm:h-[9.25rem] max-sm:min-h-[9.25rem] max-sm:px-4 max-sm:py-4";

export const mobileMetricIconFrameClass = "max-sm:h-10 max-sm:w-10";

export const mobileMetricIconWrapperClass =
  "order-2 flex shrink-0 items-center justify-center max-sm:absolute max-sm:right-1.5 max-sm:top-1.5 max-sm:h-auto max-sm:w-auto max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent lg:order-1 lg:relative lg:right-auto lg:top-auto lg:self-center";

/** Shared top-right metric icon size on phone portrait */
export const mobileMetricIconSizeClass = "max-sm:h-8 max-sm:w-8";

/** Reserve space for Karl Status phrase values without changing card height */
export const mobileKarlStatusValueAreaClass =
  "max-sm:min-h-[4.75rem] max-sm:max-h-[4.75rem]";

/** Two-line metric headings on phone portrait */
export const mobileMetricTwoLineLabelClass = "max-sm:leading-[1.15]";

/** Mobile metric indicator spacing — anchors sliders/curve in the card lower half */
export const mobileMetricIndicatorClass =
  "mt-auto hidden w-full max-sm:block max-sm:pt-3";

export const mobileMetricSliderTrackClass = "relative h-[6px] w-full overflow-hidden rounded-full";

/** Phone portrait insight card padding/gap — used below lg only */
export const mobileInsightCardSurfaceClass =
  "max-sm:gap-4 max-sm:px-4 max-sm:py-[1.125rem]";

export const mobileCardLabelClass =
  "max-sm:text-[0.6875rem] max-sm:tracking-[0.12em] max-sm:text-white/50";

/** Shared primary metric value typography for phone portrait metric tiles */
export const mobileMetricPrimaryValueClass = "max-sm:text-[1.95rem]";

/** Phrase-sized Karl Status value on phone portrait — smaller than numeric metrics */
export const mobileKarlStatusValueClass =
  "max-sm:!text-[1.5625rem] max-sm:!line-clamp-3 max-sm:leading-snug";

export const mobileInsightIconFrameClass = "max-sm:h-12 max-sm:w-12";

/** Compact icon frame for mobile Best Right Now list rows */
export const mobileListIconFrameClass = "max-sm:h-10 max-sm:w-10";

export const desktopGlassCardClass = overlayGlassCardClass;

export const desktopMistIconClass =
  "lg:border-white/14 lg:bg-white/6 lg:text-white/88";

export const desktopGoldIconClass =
  "lg:border-karl-gold/22 lg:bg-karl-gold/8 lg:text-karl-gold";

export const desktopMetricIconFrameClass =
  "flex shrink-0 items-center justify-center lg:h-12 lg:w-12 lg:rounded-full lg:border";

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
