import { describe, expect, it } from 'vitest';

import {
  CONTENT_COLUMN_MAX_WIDTH,
  contentColumnWidth,
  contentHorizontalPadding,
  LAYOUT_VERIFICATION_WIDTHS,
} from '@/lib/layout/responsiveWidth';

/**
 * Phase 25 §15/§18 — responsive layout-budget checks for the Favorites
 * screen across the required verification matrix (320 / 390 / 430 / 768 /
 * 820 / 1024 / 1180), following the same arithmetic-budget convention as
 * `lib/layout/responsiveWidth.test.ts` rather than rendering components (no
 * React Native test renderer is installed).
 */

/** SavedLocationCard fixed-width elements outside the flexible copy block. */
const LOCATION_THUMB_WIDTH = 44;
const HEART_BUTTON_WIDTH_SM = 32;
const CHEVRON_WIDTH = 12;
/** `metrics` column reserves room for temperature + a compact condition chip. */
const METRICS_COLUMN_MIN_WIDTH = 64;
const CARD_ROW_GAP = 8;
const CARD_HORIZONTAL_PADDING = 10;
const SAVED_CARD_FIXED_GAPS = 4; // icon↔copy, copy↔metrics, metrics↔heart, heart↔chevron

function savedLocationCopyBudget(width: number): number {
  const column = contentColumnWidth(width);
  const cardInnerWidth = column - CARD_HORIZONTAL_PADDING * 2;
  const fixedElements =
    LOCATION_THUMB_WIDTH +
    METRICS_COLUMN_MIN_WIDTH +
    HEART_BUTTON_WIDTH_SM +
    CHEVRON_WIDTH +
    CARD_ROW_GAP * SAVED_CARD_FIXED_GAPS;

  return cardInnerWidth - fixedElements;
}

describe('Favorites — responsive layout budget', () => {
  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'keeps the saved-location card row non-overflowing at $name ($width)',
    ({ width }) => {
      expect(savedLocationCopyBudget(width)).toBeGreaterThan(0);
    },
  );

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'caps the Favorites content column at $name so tablet does not full-bleed stretch',
    ({ width }) => {
      const column = contentColumnWidth(width);
      expect(column).toBeLessThanOrEqual(CONTENT_COLUMN_MAX_WIDTH);
      expect(column).toBeLessThanOrEqual(width);
    },
  );

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'keeps the 3-up summary row readable (no microscopic text) at $name ($width)',
    ({ width }) => {
      const column = contentColumnWidth(width);
      const gutter = contentHorizontalPadding(width);
      const rowGap = 8; // Spacing.sm between the three summary cards
      const cardWidth = (column - rowGap * 2) / 3;

      // Each summary card must stay wide enough to hold a 1-2 digit value
      // plus its label without the row forcing a font-size reduction.
      expect(cardWidth).toBeGreaterThanOrEqual(80);
      expect(gutter).toBeGreaterThan(0);
    },
  );

  it('narrowest phone (320) still leaves positive copy width for saved-location cards', () => {
    expect(savedLocationCopyBudget(320)).toBeGreaterThan(60);
  });

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'keeps the empty-state Tip inset from the content column at $name ($width)',
    ({ width }) => {
      const column = contentColumnWidth(width);
      const extraInset = 16; // tipSlot paddingHorizontal Spacing.md
      const tipWidth = Math.max(0, column - extraInset * 2);

      expect(tipWidth).toBeGreaterThan(200);
      expect(tipWidth).toBeLessThan(column);
      expect(column - tipWidth).toBe(extraInset * 2);
    },
  );
});
