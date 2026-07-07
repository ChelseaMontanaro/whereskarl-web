// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ClearestSpotBellCurve } from "@/components/home/ClearestSpotBellCurve";
import {
  CLEAREST_SPOT_BELL_CURVE_VIEWBOX,
  clearestSpotBellCurveAriaLabel,
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

  it("uses a taller svg viewport for the bell curve", () => {
    render(<ClearestSpotBellCurve score={81} />);

    expect(screen.getByTestId("clearest-spot-bell-curve-svg")).toHaveAttribute(
      "data-viewbox-height",
      String(CLEAREST_SPOT_BELL_CURVE_VIEWBOX.height),
    );
    expect(screen.getByTestId("clearest-spot-bell-curve-svg").className).toContain("h-16");
  });
});
