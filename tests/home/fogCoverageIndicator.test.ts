// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import {
  clampFogCoveragePercent,
  fogCoverageIndicatorAriaLabel,
  fogCoverageSliderFillWidth,
} from "@/lib/home/fogCoverageIndicator";

describe("fogCoverageIndicator", () => {
  it("clamps fog coverage percentages between 0 and 100", () => {
    expect(clampFogCoveragePercent(-12)).toBe(0);
    expect(clampFogCoveragePercent(0)).toBe(0);
    expect(clampFogCoveragePercent(53)).toBe(53);
    expect(clampFogCoveragePercent(100)).toBe(100);
    expect(clampFogCoveragePercent(140)).toBe(100);
  });

  it("derives slider fill width from the clamped percentage", () => {
    expect(fogCoverageSliderFillWidth(53)).toBe("53%");
    expect(fogCoverageSliderFillWidth(140)).toBe("100%");
  });

  it("builds an accessible fog coverage label", () => {
    expect(fogCoverageIndicatorAriaLabel(53)).toBe("Fog coverage: 53 percent");
    expect(fogCoverageIndicatorAriaLabel(140)).toBe("Fog coverage: 100 percent");
  });
});
