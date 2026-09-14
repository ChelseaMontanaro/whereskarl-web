import { describe, expect, it } from 'vitest';

import { BOTTOM_NAV_MAP_PHONE_OFFSET } from '@/constants/bottomNav';
import {
  phoneSheetFitsViewport,
  resolvePhoneSheetExpandedMaxHeight,
  resolvePhoneSheetPeekAllowance,
  PHONE_SHEET_EXPANDED_VIEWPORT_RATIO,
} from '@/lib/map/phoneSelectedSheetLayout';

/**
 * Required verification range (width × height × safe-area insets). Heights and
 * insets are the real portrait geometry for each width class — the layout
 * itself never branches on any of them.
 */
const VIEWPORTS = [
  { width: 320, height: 568, top: 20, bottom: 0, label: 'iPhone SE (1st gen)' },
  { width: 390, height: 844, top: 47, bottom: 34, label: 'iPhone 12–16' },
  { width: 430, height: 932, top: 59, bottom: 34, label: 'iPhone Pro Max' },
  { width: 768, height: 1024, top: 20, bottom: 20, label: 'iPad mini/9.7' },
  { width: 820, height: 1180, top: 24, bottom: 20, label: 'iPad Air' },
  { width: 1024, height: 1366, top: 24, bottom: 20, label: 'iPad Pro 12.9' },
  { width: 1180, height: 820, top: 24, bottom: 20, label: 'iPad Air landscape' },
];

describe('Phase 24 phone selected-sheet expanded height', () => {
  it('replaces the fixed 320pt cap with viewport-derived height', () => {
    // The old cap was identical on every device; the new one is not.
    const heights = VIEWPORTS.map((viewport) =>
      resolvePhoneSheetExpandedMaxHeight(
        viewport.height,
        viewport.top,
        viewport.bottom,
      ),
    );

    expect(new Set(heights).size).toBeGreaterThan(1);
  });

  it('stays inside the usable viewport at every verified size', () => {
    for (const viewport of VIEWPORTS) {
      expect(
        phoneSheetFitsViewport(viewport.height, viewport.top, viewport.bottom),
      ).toBe(true);
    }
  });

  it('leaves a usable scroll body at every verified size', () => {
    for (const viewport of VIEWPORTS) {
      const height = resolvePhoneSheetExpandedMaxHeight(
        viewport.height,
        viewport.top,
        viewport.bottom,
      );

      expect(height).toBeGreaterThan(200);
    }
  });

  it('clears the bottom nav and both safe areas at every verified size', () => {
    for (const viewport of VIEWPORTS) {
      const expanded = resolvePhoneSheetExpandedMaxHeight(
        viewport.height,
        viewport.top,
        viewport.bottom,
      );

      const consumed =
        expanded +
        resolvePhoneSheetPeekAllowance() +
        BOTTOM_NAV_MAP_PHONE_OFFSET +
        viewport.top +
        viewport.bottom;

      expect(consumed).toBeLessThanOrEqual(viewport.height);
    }
  });

  it('grows with available height rather than being capped short', () => {
    const short = resolvePhoneSheetExpandedMaxHeight(568, 20, 0);
    const tall = resolvePhoneSheetExpandedMaxHeight(932, 59, 34);

    expect(tall).toBeGreaterThan(short);
    // A tall phone gets far more than the old fixed 320pt cap allowed.
    expect(tall).toBeGreaterThan(320);
  });

  it('tracks the reference 62dvh ratio when space allows', () => {
    // 390x844 and 430x932 both have room for the preferred ratio.
    expect(resolvePhoneSheetExpandedMaxHeight(932, 59, 34)).toBe(
      Math.round(932 * PHONE_SHEET_EXPANDED_VIEWPORT_RATIO),
    );
  });

  it('degrades to available space on short viewports instead of overflowing', () => {
    const height = resolvePhoneSheetExpandedMaxHeight(568, 20, 0);

    expect(height).toBeLessThan(
      Math.round(568 * PHONE_SHEET_EXPANDED_VIEWPORT_RATIO),
    );
    expect(phoneSheetFitsViewport(568, 20, 0)).toBe(true);
  });

  it('handles a pathologically short viewport without going negative', () => {
    expect(
      resolvePhoneSheetExpandedMaxHeight(320, 20, 0),
    ).toBeGreaterThanOrEqual(0);
    expect(phoneSheetFitsViewport(320, 20, 0)).toBe(true);
  });

  it('sacrifices body height, never the peek, when space runs out', () => {
    // Extreme text size on the shortest supported viewport.
    const height = resolvePhoneSheetExpandedMaxHeight(568, 20, 0, 2);

    expect(height).toBeGreaterThanOrEqual(0);
    expect(phoneSheetFitsViewport(568, 20, 0, 2)).toBe(true);
  });

  it('shrinks the scroll body as the OS text size grows', () => {
    // An enlarged-text device has a taller peek, so it must be handed a
    // smaller body — otherwise the sheet pushes its own header off-screen.
    const standard = resolvePhoneSheetExpandedMaxHeight(844, 47, 34, 1);
    const enlarged = resolvePhoneSheetExpandedMaxHeight(844, 47, 34, 1.35);

    expect(enlarged).toBeLessThan(standard);
    expect(phoneSheetFitsViewport(844, 47, 34, 1.35)).toBe(true);
  });

  it('stays inside the viewport across the full text-size range', () => {
    for (const viewport of VIEWPORTS) {
      for (const fontScale of [1, 1.15, 1.35, 1.6, 2]) {
        expect(
          phoneSheetFitsViewport(
            viewport.height,
            viewport.top,
            viewport.bottom,
            fontScale,
          ),
        ).toBe(true);
      }
    }
  });

  it('ignores a smaller-than-default or invalid font scale', () => {
    const base = resolvePhoneSheetExpandedMaxHeight(844, 47, 34, 1);

    expect(resolvePhoneSheetExpandedMaxHeight(844, 47, 34, 0.5)).toBe(base);
    expect(resolvePhoneSheetExpandedMaxHeight(844, 47, 34, Number.NaN)).toBe(
      base,
    );
  });
});
