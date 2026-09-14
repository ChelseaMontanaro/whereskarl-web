import { describe, expect, it } from 'vitest';

import {
  estimatePhonePortraitChipWidth,
  phonePortraitChipRowContentWidth,
  phonePortraitChipRowFits,
  phonePortraitLastChipFullyReachable,
  PHONE_PORTRAIT_CHIP_GAP,
  PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE,
  PHONE_PORTRAIT_CHIP_MIN_HEIGHT,
  PHONE_PORTRAIT_CHIP_MIN_WIDTH,
  PHONE_PORTRAIT_CHIP_ROW_INSET,
} from '@/lib/map/phonePortraitRegionChips';
import { BAY_AREA_PRODUCT_REGIONS } from '@/lib/map/regions';

const CHIP_LABELS = BAY_AREA_PRODUCT_REGIONS.map((region) => region.chipLabel);

function chipWidths(fontScale = 1): number[] {
  return CHIP_LABELS.map((label) =>
    estimatePhonePortraitChipWidth(label, fontScale),
  );
}

describe('Phase 24 phone-portrait region chip row', () => {
  it('renders all five canonical regions', () => {
    expect(CHIP_LABELS).toEqual([
      'SF',
      'North Bay',
      'East Bay',
      'South Bay',
      'Peninsula',
    ]);
  });

  it('keeps the approved touch-target floor', () => {
    expect(PHONE_PORTRAIT_CHIP_MIN_HEIGHT).toBe(40);
    expect(PHONE_PORTRAIT_CHIP_MIN_WIDTH).toBe(44);
    // Short labels ("SF") are widened to the minimum rather than shrunk.
    expect(estimatePhonePortraitChipWidth('SF')).toBe(
      PHONE_PORTRAIT_CHIP_MIN_WIDTH,
    );
  });

  it('bounds Dynamic Type growth so the row width stays deterministic', () => {
    // The physical-iPhone clipping defect came from unbounded label growth
    // (~1.33x) against a fixed-CSS-px web reference. Closing Phase 24 required
    // all five chips to fit at rest, which only holds if the row's width cannot
    // grow at all — so the bound is now exact web parity with `text-xs`.
    expect(PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE).toBe(1);
  });

  it('counts content width as inset + chips + gaps + inset, with no excess', () => {
    const widths = chipWidths();
    const expected =
      PHONE_PORTRAIT_CHIP_ROW_INSET * 2 +
      widths.reduce((total, width) => total + width, 0) +
      (widths.length - 1) * PHONE_PORTRAIT_CHIP_GAP;

    expect(phonePortraitChipRowContentWidth(widths)).toBe(expected);
  });

  it('fits and centres all five chips on a 430pt viewport at default text size', () => {
    expect(phonePortraitChipRowFits(430, chipWidths())).toBe(true);
  });

  it('fits all five chips on a 390pt viewport, not just a 430pt one', () => {
    // Closing Phase 24 required the row to fit the common phone width too, so
    // "Peninsula" is fully readable at rest without any horizontal scrolling.
    expect(phonePortraitChipRowFits(390, chipWidths())).toBe(true);
  });

  it('regression: an inflated trailing spacer is what overflowed the row', () => {
    // A 40pt artificial spacer had been added to work around RN under-counting
    // content-container padding; it alone pushed the row past a 390pt viewport.
    const widths = chipWidths();
    const inflated = phonePortraitChipRowContentWidth(widths) + 40;

    expect(inflated).toBeGreaterThan(390);
    expect(phonePortraitChipRowContentWidth(widths)).toBeLessThanOrEqual(390);
    // The real trailing inset is the web row's `px-0.5`, not an invented value.
    expect(PHONE_PORTRAIT_CHIP_ROW_INSET).toBe(2);
  });

  it('regression: unbounded Dynamic Type is what cut off Peninsula', () => {
    // ~1.33x was the measured multiplier on the reported device.
    const unbounded = phonePortraitChipRowContentWidth(chipWidths(1.33));
    const bounded = phonePortraitChipRowContentWidth(
      chipWidths(PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE),
    );

    expect(unbounded).toBeGreaterThan(430);
    expect(bounded).toBeLessThan(unbounded);
  });

  it('never leaves the trailing chip unreachable at any supported width', () => {
    for (const viewportWidth of [320, 390, 430, 768, 820, 1024, 1180]) {
      for (const fontScale of [1, PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE]) {
        expect(
          phonePortraitLastChipFullyReachable(
            viewportWidth,
            chipWidths(fontScale),
          ),
        ).toBe(true);
      }
    }
  });

  it('scrolls rather than clips on narrow viewports', () => {
    // Web behaves the same way at 320/390: the row overflows and scrolls.
    expect(phonePortraitChipRowFits(320, chipWidths())).toBe(false);
    expect(phonePortraitLastChipFullyReachable(320, chipWidths())).toBe(true);
  });

  it('fits comfortably at tablet widths with no overflow', () => {
    for (const viewportWidth of [768, 820, 1024, 1180]) {
      expect(phonePortraitChipRowFits(viewportWidth, chipWidths())).toBe(true);
    }
  });

  it('treats an empty row as just its insets', () => {
    expect(phonePortraitChipRowContentWidth([])).toBe(
      PHONE_PORTRAIT_CHIP_ROW_INSET * 2,
    );
    expect(phonePortraitLastChipFullyReachable(390, [])).toBe(true);
  });
});
