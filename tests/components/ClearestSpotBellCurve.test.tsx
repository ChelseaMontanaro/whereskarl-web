// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ClearestSpotBellCurve } from "@/components/home/ClearestSpotBellCurve";
import {
  CLEAREST_SPOT_BELL_CURVE_VIEWBOX,
  clearestSpotBellCurveAriaLabel,
} from "@/lib/home/metricPercent";

describe("ClearestSpotBellCurve", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([20, 50, 79, 100])("renders a smooth curve with dot x-position at score %i", (score) => {
    render(<ClearestSpotBellCurve score={score} />);

    expect(
      screen.getByRole("img", { name: clearestSpotBellCurveAriaLabel(score) }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("clearest-spot-bell-curve-peak")).toHaveAttribute(
      "cx",
      String(score),
    );

    const path = screen.getByTestId("clearest-spot-bell-curve-path");
    expect(path.getAttribute("d")?.split(" C ").length).toBeGreaterThanOrEqual(2);
  });

  it("uses a taller svg viewport for the bell curve", () => {
    render(<ClearestSpotBellCurve score={81} />);

    expect(screen.getByTestId("clearest-spot-bell-curve-svg")).toHaveAttribute(
      "data-viewbox-height",
      String(CLEAREST_SPOT_BELL_CURVE_VIEWBOX.height),
    );
    expect(screen.getByTestId("clearest-spot-bell-curve-svg").className).toContain("h-12");
  });
});
