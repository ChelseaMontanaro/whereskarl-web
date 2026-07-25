import { afterEach, describe, expect, it } from "vitest";

import {
  getPhonePortraitLabelOffsetScale,
  getPhonePortraitMarkerLabelOffset,
  PHONE_PORTRAIT_LABEL_OFFSET_FULL_SCALE_ZOOM,
  PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE,
  PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE_ZOOM,
  PHONE_PORTRAIT_MARKER_LABEL_OFFSETS,
  resolvePhonePortraitMarkerLabelOffset,
} from "@/lib/map/phonePortraitMapPresentation";

/**
 * Canonical contract:
 *   - ordinary markers resolve to `[0, 0]` (CSS owns attachment)
 *   - the exception table stays empty or minimal
 *   - zoom scaling remains correct for any genuine exception
 */

const ORDINARY_LOCATIONS = [
  "mill-valley",
  "tiburon",
  "sausalito",
  "stinson-beach",
  "san-francisco",
  "berkeley",
  "presidio",
  "golden-gate-park",
  "ocean-beach",
  "marin-headlands",
  "oakland",
  "daly-city",
] as const;

afterEach(() => {
  // Tests may install a temporary exception to exercise the zoom curve.
  for (const key of Object.keys(PHONE_PORTRAIT_MARKER_LABEL_OFFSETS)) {
    delete PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[key];
  }
});

describe("PHONE_PORTRAIT_MARKER_LABEL_OFFSETS baseline", () => {
  it("is empty or exception-only (no ordinary attachment tuning)", () => {
    // Production baseline: no non-zero ordinary offsets.
    expect(Object.keys(PHONE_PORTRAIT_MARKER_LABEL_OFFSETS)).toEqual([]);
  });

  it("resolves ordinary markers to [0, 0] via the shared fallback", () => {
    for (const id of ORDINARY_LOCATIONS) {
      expect(getPhonePortraitMarkerLabelOffset(id)).toEqual([0, 0]);
      expect(resolvePhonePortraitMarkerLabelOffset(id, 10.5)).toEqual([0, 0]);
      expect(resolvePhonePortraitMarkerLabelOffset(id, 9.3)).toEqual([0, 0]);
      expect(resolvePhonePortraitMarkerLabelOffset(id, 8.3)).toEqual([0, 0]);
    }
  });
});

describe("getPhonePortraitLabelOffsetScale", () => {
  it("returns full scale (1.0) at and above the reference zoom", () => {
    expect(getPhonePortraitLabelOffsetScale(10.3)).toBe(1);
    expect(getPhonePortraitLabelOffsetScale(10.5)).toBe(1);
    expect(getPhonePortraitLabelOffsetScale(12)).toBe(1);
  });

  it("returns ~60% at the mid breakpoint (zoom 9.3)", () => {
    expect(getPhonePortraitLabelOffsetScale(9.3)).toBeCloseTo(0.6, 5);
    expect(getPhonePortraitLabelOffsetScale(9.3)).toBeGreaterThanOrEqual(0.55);
    expect(getPhonePortraitLabelOffsetScale(9.3)).toBeLessThanOrEqual(0.65);
  });

  it("returns the minimum floor (~20%) at and below the low breakpoint (zoom 8.3)", () => {
    expect(getPhonePortraitLabelOffsetScale(8.3)).toBeCloseTo(0.2, 5);
    expect(getPhonePortraitLabelOffsetScale(7)).toBe(
      PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE,
    );
    expect(getPhonePortraitLabelOffsetScale(6)).toBeGreaterThanOrEqual(0.15);
    expect(getPhonePortraitLabelOffsetScale(6)).toBeLessThanOrEqual(0.25);
  });

  it("is clamped to [0, 1] for extreme and invalid zooms", () => {
    for (const z of [-100, 0, 6, 8.3, 9.3, 10.3, 30]) {
      const s = getPhonePortraitLabelOffsetScale(z);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    }
    expect(getPhonePortraitLabelOffsetScale(Number.NaN)).toBe(1);
    expect(getPhonePortraitLabelOffsetScale(Number.POSITIVE_INFINITY)).toBe(1);
  });

  it("is monotonically non-decreasing in zoom", () => {
    let previous = -1;
    for (let z = 6; z <= 12; z += 0.1) {
      const s = getPhonePortraitLabelOffsetScale(z);
      expect(s).toBeGreaterThanOrEqual(previous);
      previous = s;
    }
  });

  it("exposes sane breakpoint constants", () => {
    expect(PHONE_PORTRAIT_LABEL_OFFSET_FULL_SCALE_ZOOM).toBeGreaterThan(
      PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE_ZOOM,
    );
    expect(PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE).toBeGreaterThan(0);
    expect(PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE).toBeLessThan(1);
  });
});

describe("resolvePhonePortraitMarkerLabelOffset for genuine exceptions", () => {
  const EXCEPTION_ID = "__test-geographic-exception";

  it("returns the exact configured exception at the reference zoom", () => {
    PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[EXCEPTION_ID] = [10, 20];
    expect(getPhonePortraitMarkerLabelOffset(EXCEPTION_ID)).toEqual([10, 20]);
    expect(
      resolvePhonePortraitMarkerLabelOffset(EXCEPTION_ID, 10.3),
    ).toEqual([10, 20]);
  });

  it("proportionally reduces genuine exceptions at mid zoom", () => {
    PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[EXCEPTION_ID] = [10, 20];
    const [x, y] = resolvePhonePortraitMarkerLabelOffset(EXCEPTION_ID, 9.3);
    expect(x).toBeCloseTo(10 * 0.6, 5);
    expect(y).toBeCloseTo(20 * 0.6, 5);
  });

  it("strongly reduces genuine exceptions at low zoom", () => {
    PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[EXCEPTION_ID] = [10, 20];
    const [x, y] = resolvePhonePortraitMarkerLabelOffset(EXCEPTION_ID, 8.3);
    expect(x).toBeCloseTo(10 * 0.2, 5);
    expect(y).toBeCloseTo(20 * 0.2, 5);
  });

  it("keeps ordinary [0, 0] markers at zero for every zoom", () => {
    for (const z of [8, 9.3, 10.5]) {
      expect(resolvePhonePortraitMarkerLabelOffset("oakland", z)).toEqual([
        0, 0,
      ]);
      expect(resolvePhonePortraitMarkerLabelOffset("tiburon", z)).toEqual([
        0, 0,
      ]);
    }
  });
});
