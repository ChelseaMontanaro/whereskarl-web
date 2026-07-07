// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import {
  CLEAREST_SPOT_BELL_CURVE_BASELINE_Y,
  clampMetricPercent,
  clearestSpotBellCurveLeftControlX,
  clearestSpotBellCurvePath,
  clearestSpotBellCurvePeakY,
  clearestSpotBellCurveRightControlX,
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

  it.each([20, 50, 79, 100])(
    "builds a smooth two-segment bell curve for score %i",
    (score) => {
      const peakX = clampMetricPercent(score);
      const peakY = clearestSpotBellCurvePeakY(peakX);
      const path = clearestSpotBellCurvePath(peakX);

      expect(path.split(" C ").length).toBeGreaterThanOrEqual(2);
      expect(path).toContain(`${peakX} ${peakY}`);

      if (score > 0 && score < 100) {
        const leftMid = clearestSpotBellCurveLeftControlX(peakX);
        const rightMid = clearestSpotBellCurveRightControlX(peakX);

        expect(path).toContain(`${leftMid} ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}`);
        expect(path).toContain(`${leftMid} ${peakY}`);
        expect(path).toContain(`${rightMid} ${peakY}`);
        expect(path).toContain(`${rightMid} ${CLEAREST_SPOT_BELL_CURVE_BASELINE_Y}`);
        expect(rightMid).toBeGreaterThan(peakX);
        expect(leftMid).toBeLessThan(peakX);
      }

      if (score >= 79 && score < 100) {
        expect(clearestSpotBellCurveRightControlX(score)).toBeGreaterThan(score);
      }
    },
  );

  it("positions the bell curve peak dot x-coordinate from the live score", () => {
    expect(clearestSpotBellCurvePath(79)).toContain(`79 ${clearestSpotBellCurvePeakY(79)}`);
    expect(clearestSpotBellCurvePath(81)).toContain(`81 ${clearestSpotBellCurvePeakY(81)}`);
  });
});
