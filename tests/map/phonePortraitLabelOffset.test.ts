import { describe, expect, it } from "vitest";

import {
  getPhonePortraitLabelOffsetScale,
  getPhonePortraitMarkerLabelOffset,
  PHONE_PORTRAIT_LABEL_OFFSET_FULL_SCALE_ZOOM,
  PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE,
  PHONE_PORTRAIT_LABEL_OFFSET_MIN_SCALE_ZOOM,
  resolvePhonePortraitMarkerLabelOffset,
} from "@/lib/map/phonePortraitMapPresentation";

/**
 * Canonical zoom-scaling contract for phone-portrait label/score offsets.
 * A single deterministic, monotonic, clamped curve is shared by every location.
 */
describe("getPhonePortraitLabelOffsetScale", () => {
  it("returns full scale (1.0) at and above the reference zoom", () => {
    expect(getPhonePortraitLabelOffsetScale(10.3)).toBe(1);
    expect(getPhonePortraitLabelOffsetScale(10.5)).toBe(1);
    expect(getPhonePortraitLabelOffsetScale(12)).toBe(1);
  });

  it("returns ~60% at the mid breakpoint (zoom 9.3)", () => {
    // Linear between (8.3 -> 0.2) and (10.3 -> 1.0): midpoint 9.3 -> 0.6.
    expect(getPhonePortraitLabelOffsetScale(9.3)).toBeCloseTo(0.6, 5);
    // Within the requested 55–65% band.
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
    // Non-finite zoom falls back to full scale (safe default).
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

describe("resolvePhonePortraitMarkerLabelOffset", () => {
  it("returns the exact configured offset at the reference zoom", () => {
    const configured = getPhonePortraitMarkerLabelOffset("stinson-beach");
    expect(configured).toEqual([58, 64]);
    expect(resolvePhonePortraitMarkerLabelOffset("stinson-beach", 10.3)).toEqual(
      configured,
    );
  });

  it("proportionally reduces the configured offset at mid zoom", () => {
    const [x, y] = resolvePhonePortraitMarkerLabelOffset("stinson-beach", 9.3);
    expect(x).toBeCloseTo(58 * 0.6, 5);
    expect(y).toBeCloseTo(64 * 0.6, 5);
  });

  it("strongly reduces the configured offset at low zoom", () => {
    const [x, y] = resolvePhonePortraitMarkerLabelOffset("stinson-beach", 8.3);
    expect(x).toBeCloseTo(58 * 0.2, 5);
    expect(y).toBeCloseTo(64 * 0.2, 5);
  });

  it("keeps zero offsets at zero for every zoom (e.g. oakland)", () => {
    for (const z of [8, 9.3, 10.5]) {
      expect(resolvePhonePortraitMarkerLabelOffset("oakland", z)).toEqual([
        0, 0,
      ]);
    }
  });

  it("scales all offset locations by the same factor", () => {
    const scale = getPhonePortraitLabelOffsetScale(9.3);
    for (const id of ["mill-valley", "tiburon", "sausalito", "berkeley"]) {
      const [cx, cy] = getPhonePortraitMarkerLabelOffset(id);
      const [rx, ry] = resolvePhonePortraitMarkerLabelOffset(id, 9.3);
      expect(rx).toBeCloseTo(cx * scale, 5);
      expect(ry).toBeCloseTo(cy * scale, 5);
    }
  });
});
