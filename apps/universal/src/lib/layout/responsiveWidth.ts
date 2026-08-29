/**
 * Width-based responsive layout helpers.
 *
 * Breakpoints are viewport widths only — never device model / product names.
 *
 * Supported verification matrix (must all pass layout budgets):
 *   narrowest phone  320  ← floor; do not design only for ~390
 *   standard phone   390
 *   large phone      430
 *   tablet portrait  768 / 820
 *   tablet landscape 1024 / 1180
 */

/** Narrowest supported Universal phone portrait viewport width (pts). */
export const NARROWEST_SUPPORTED_VIEWPORT_WIDTH = 320;

/** Shared Home / Favorites / Map sheet content column cap. */
export const CONTENT_COLUMN_MAX_WIDTH = 430;

export const LAYOUT_WIDTH = {
  narrowPhone: NARROWEST_SUPPORTED_VIEWPORT_WIDTH,
  standardPhone: 390,
  largePhone: CONTENT_COLUMN_MAX_WIDTH,
  tabletPortrait: 768,
  tabletPortraitWide: 820,
  desktop: 1024,
  tabletLandscapeWide: 1180,
} as const;

export type LayoutWidthBand =
  | 'narrow'
  | 'compact'
  | 'regular'
  | 'wide'
  | 'desktop';

/** Classify a viewport width into a content band (no device checks). */
export function resolveLayoutWidthBand(width: number): LayoutWidthBand {
  if (width < 360) {
    return 'narrow';
  }
  if (width < 600) {
    return 'compact';
  }
  if (width < 768) {
    return 'regular';
  }
  if (width < 1024) {
    return 'wide';
  }
  return 'desktop';
}

/** Horizontal page gutter that scales by viewport width. */
export function contentHorizontalPadding(viewportWidth: number): number {
  if (viewportWidth < 360) {
    return 12;
  }
  if (viewportWidth < 600) {
    return 16;
  }
  return 24;
}

/**
 * Usable centered content-column width after page gutters, capped at
 * CONTENT_COLUMN_MAX_WIDTH so tablet viewports do not full-bleed stretch.
 */
export function contentColumnWidth(viewportWidth: number): number {
  const padded = Math.max(
    0,
    viewportWidth - contentHorizontalPadding(viewportWidth) * 2,
  );
  return Math.min(CONTENT_COLUMN_MAX_WIDTH, padded);
}

/**
 * Letter-spacing for the uppercase brand tagline so it stays one line inside
 * the content column — especially at NARROWEST_SUPPORTED_VIEWPORT_WIDTH.
 */
export function brandTaglineLetterSpacing(viewportWidth: number): number {
  const column = contentColumnWidth(viewportWidth);
  // Extra brand inset (~16) reduces the line’s usable width.
  const lineBudget = Math.max(0, column - 16);

  if (lineBudget < 260) {
    return 1.2;
  }
  if (lineBudget < 300) {
    return 1.8;
  }
  if (lineBudget < 340) {
    return 2.6;
  }
  return 3.2;
}

/**
 * Conservative estimated rendered width for
 * “TRACK KARL ACROSS THE BAY” at fontSize 12 + given letterSpacing.
 * Used only for layout-budget verification (not runtime rendering).
 */
export function estimateBrandTaglineWidth(letterSpacing: number): number {
  const text = 'TRACK KARL ACROSS THE BAY';
  const glyphWidth = 12 * 0.62; // serif uppercase approx
  return text.length * glyphWidth + (text.length - 1) * letterSpacing;
}

/** True when the brand tagline budget fits the content column for a width. */
export function brandTaglineFitsViewport(viewportWidth: number): boolean {
  const spacing = brandTaglineLetterSpacing(viewportWidth);
  const estimated = estimateBrandTaglineWidth(spacing);
  // Brand row also has small horizontal inset inside the column.
  const lineBudget = Math.max(0, contentColumnWidth(viewportWidth) - 16);
  return estimated <= lineBudget;
}

/**
 * Max width for floating phone-map chrome (selected sheet, etc.).
 * Caps stretch on tablet / landscape widths; full width on narrow phones.
 */
export function floatingChromeMaxWidth(viewportWidth: number): number {
  return Math.min(CONTENT_COLUMN_MAX_WIDTH, viewportWidth);
}

/** Two-up metric card inner width inside the content column. */
export function metricCardContentWidth(viewportWidth: number): number {
  const column = contentColumnWidth(viewportWidth);
  const gutter = 8; // ~1.5% gap between 48.5% cards
  return (column - gutter) / 2;
}

/** Representative widths used for layout verification tests. */
export const LAYOUT_VERIFICATION_WIDTHS = [
  {
    name: 'narrowest-phone',
    width: LAYOUT_WIDTH.narrowPhone,
    height: 568,
  },
  {
    name: 'standard-phone',
    width: LAYOUT_WIDTH.standardPhone,
    height: 844,
  },
  {
    name: 'large-phone',
    width: LAYOUT_WIDTH.largePhone,
    height: 932,
  },
  {
    name: 'tablet-portrait',
    width: LAYOUT_WIDTH.tabletPortrait,
    height: 1024,
  },
  {
    name: 'tablet-portrait-wide',
    width: LAYOUT_WIDTH.tabletPortraitWide,
    height: 1180,
  },
  {
    name: 'tablet-landscape',
    width: LAYOUT_WIDTH.desktop,
    height: 768,
  },
  {
    name: 'tablet-landscape-wide',
    width: LAYOUT_WIDTH.tabletLandscapeWide,
    height: 820,
  },
] as const;
