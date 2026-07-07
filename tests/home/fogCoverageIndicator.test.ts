// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import {
  clampFogCoveragePercent,
  fogCoverageIndicatorAriaLabel,
  fogCoverageSliderFillColor,
  fogCoverageSliderFillWidth,
  fogCoverageSliderKnobBorderClass,
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

  it("uses a light mist fill color visible on dark hero backgrounds", () => {
    expect(fogCoverageSliderFillColor).toBe("rgb(140 184 216)");
    expect(fogCoverageSliderFillColor).not.toContain("3 11 20");
  });

  it("uses a high-contrast knob border token for the fog slider", () => {
    expect(fogCoverageSliderKnobBorderClass).toBe("border-[#8CB8D8]");
  });
});
