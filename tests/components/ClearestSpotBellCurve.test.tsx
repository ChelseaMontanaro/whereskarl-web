// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  ClearestSpotBellCurve,
  clearestSpotBellCurveContainerClass,
  clearestSpotBellCurveFrameClass,
} from "@/components/home/ClearestSpotBellCurve";
import {
  CLEAREST_SPOT_BELL_CURVE_VIEWBOX,
  clearestSpotBellCurveAriaLabel,
  clearestSpotBellCurveDisplayViewBox,
  clearestSpotBellCurveVisualX,
} from "@/lib/home/metricPercent";

describe("ClearestSpotBellCurve", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    [20, clearestSpotBellCurveVisualX(20)],
    [50, 50],
    [79, clearestSpotBellCurveVisualX(79)],
    [100, 82],
  ])("renders the dot at mapped visual x for score %i", (score, visualX) => {
    render(<ClearestSpotBellCurve score={score} />);

    expect(
      screen.getByRole("img", { name: clearestSpotBellCurveAriaLabel(score) }),
    ).toBeInTheDocument();

    const peak = screen.getByTestId("clearest-spot-bell-curve-peak");
    expect(Number(peak.getAttribute("cx"))).toBeCloseTo(visualX, 5);
    expect(Number(peak.getAttribute("data-visual-peak-x"))).toBeCloseTo(visualX, 5);
    if (score !== 50) {
      expect(peak.getAttribute("cx")).not.toBe(String(score));
    }

    const path = screen.getByTestId("clearest-spot-bell-curve-path");
    expect(path.getAttribute("d")?.match(/ C /g)?.length).toBe(2);
    expect(path.getAttribute("d")).not.toContain(" V ");
  });

  it("renders a full-width subtle baseline beneath the curve", () => {
    render(<ClearestSpotBellCurve score={81} />);

    const baseline = screen.getByTestId("clearest-spot-bell-curve-baseline");
    expect(baseline.getAttribute("x1")).toBe("0");
    expect(baseline.getAttribute("x2")).toBe(String(CLEAREST_SPOT_BELL_CURVE_VIEWBOX.width));
  });

  it("uses the approved curve viewBox with containment padding inside a bounded frame", () => {
    render(<ClearestSpotBellCurve score={81} />);

    const container = screen.getByTestId("clearest-spot-bell-curve");
    const frame = screen.getByTestId("clearest-spot-bell-curve-frame");
    const svg = screen.getByTestId("clearest-spot-bell-curve-svg");

    expect(container.className).toBe(clearestSpotBellCurveContainerClass);
    expect(container.className).toContain("max-sm:overflow-hidden");
    expect(container.className).toContain("max-sm:pb-1.5");
    expect(container.className).toContain("max-sm:-mt-2");
    expect(frame.className).toBe(clearestSpotBellCurveFrameClass);
    expect(frame.className).toContain("max-sm:h-12");
    expect(svg).toHaveAttribute("data-viewbox-height", String(CLEAREST_SPOT_BELL_CURVE_VIEWBOX.height));
    expect(svg.getAttribute("viewBox")).toBe(clearestSpotBellCurveDisplayViewBox());
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMax meet");
    expect(svg.className).toContain("h-full");
    expect(frame.contains(svg)).toBe(true);
    expect(container.contains(frame)).toBe(true);
  });

  it("clips the curve, baseline, and peak glow inside the svg frame", () => {
    render(<ClearestSpotBellCurve score={60} />);

    const svg = screen.getByTestId("clearest-spot-bell-curve-svg");
    expect(svg.querySelector("#clearest-spot-bell-curve-clip")).not.toBeNull();
    expect(svg.querySelector('[clip-path="url(#clearest-spot-bell-curve-clip)"]')).not.toBeNull();
  });
});
