// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import {
  clampMetricPercent,
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
});
