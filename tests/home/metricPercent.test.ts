// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import {
  CLEAREST_SPOT_BELL_CURVE_BASELINE_Y,
  CLEAREST_SPOT_BELL_CURVE_END_X,
  CLEAREST_SPOT_BELL_CURVE_PEAK_Y,
  CLEAREST_SPOT_BELL_CURVE_START_X,
  clampMetricPercent,
  clearestSpotBellCurveControlPoints,
  clearestSpotBellCurvePath,
  clearestSpotBellCurveVisualX,
  clearSkiesIndicatorAriaLabel,
  fogCoverageIndicatorAriaLabel,
  metricPercentFillWidth,
} from "@/lib/home/metricPercent";

describe("metricPercent", () => {
  it("clamps metric percentages between 0 and 100", () => {
    expect(clampMetricPercent(-12)).toBe(0);
    expect(clampMetricPercent(41)).toBe(41);
    expect(clampMetricPercent(140)).toBe(100);
  });

  it("derives slider fill width from the clamped percentage", () => {
    expect(metricPercentFillWidth(41)).toBe("41%");
    expect(metricPercentFillWidth(140)).toBe("100%");
  });

  it("builds accessible labels for fog and clear skies indicators", () => {
    expect(fogCoverageIndicatorAriaLabel(59)).toBe("Fog coverage: 59 percent");
    expect(clearSkiesIndicatorAriaLabel(41)).toBe("Clear skies score: 41 out of 100");
  });

  it.each([
    [0, 18],
    [25, 32],
    [50, 50],
    [75, 68],
    [80, 72],
    [100, 82],
  ])("maps clearest spot score %i to visual x %i", (score, visualX) => {
    expect(clearestSpotBellCurveVisualX(score)).toBeCloseTo(visualX, 5);
  });

  it.each([20, 50, 79, 100])(
    "builds the approved smooth bell curve path for score %i",
    (score) => {
      const { peakX, peakY, c1x, c2x } = clearestSpotBellCurveControlPoints(score);
      const path = clearestSpotBellCurvePath(score);

      expect(path).toBe(
        `M 0 ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y} H ${CLEAREST_SPOT_BELL_CURVE_START_X} C ${c1x} ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}, ${c1x} ${peakY}, ${peakX} ${peakY} C ${c2x} ${peakY}, ${c2x} ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}, 100 ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}`,
      );
      expect(path).not.toContain(" V ");
      expect(path.match(/ C /g)?.length).toBe(2);
      expect(peakY).toBe(CLEAREST_SPOT_BELL_CURVE_PEAK_Y);
      expect(peakX).toBeGreaterThanOrEqual(CLEAREST_SPOT_BELL_CURVE_START_X);
      expect(peakX).toBeLessThanOrEqual(CLEAREST_SPOT_BELL_CURVE_END_X);
      if (score < 100) {
        expect(c2x).toBeGreaterThan(peakX);
      }
    },
  );

  it("keeps high scores right-of-center while preserving right-side taper room", () => {
    const score79 = clearestSpotBellCurveControlPoints(79);
    const score81 = clearestSpotBellCurveControlPoints(81);

    expect(score79.peakX).toBeGreaterThan(50);
    expect(score79.peakX).toBeLessThan(CLEAREST_SPOT_BELL_CURVE_END_X);
    expect(score81.peakX).toBeGreaterThan(score79.peakX);
    expect(score81.c2x).toBeLessThanOrEqual(CLEAREST_SPOT_BELL_CURVE_END_X);
  });
});
