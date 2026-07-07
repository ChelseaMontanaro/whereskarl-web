// @vitest-environment happy-dom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  ClearestSpotGauge,
  clearestSpotGaugeContainerClass,
  clearestSpotGaugeFrameClass,
} from "@/components/home/ClearestSpotGauge";
import {
  CLEAREST_SPOT_GAUGE_CENTER_X,
  CLEAREST_SPOT_GAUGE_CENTER_Y,
  CLEAREST_SPOT_GAUGE_VIEWBOX,
  clearestSpotGaugeAriaLabel,
  clearestSpotGaugeMarkerPoint,
} from "@/lib/home/clearestSpotGauge";

describe("ClearestSpotGauge", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([0, 25, 60, 80, 100])(
    "renders the marker and needle for score %i",
    (score) => {
      render(<ClearestSpotGauge score={score} />);

      expect(
        screen.getByRole("img", { name: clearestSpotGaugeAriaLabel(score) }),
      ).toBeInTheDocument();

      const marker = clearestSpotGaugeMarkerPoint(score);
      const markerElement = screen.getByTestId("clearest-spot-gauge-marker");
      expect(Number(markerElement.getAttribute("data-marker-x"))).toBeCloseTo(marker.x, 5);
      expect(Number(markerElement.getAttribute("data-marker-y"))).toBeCloseTo(marker.y, 5);

      const needle = screen.getByTestId("clearest-spot-gauge-needle");
      expect(needle.getAttribute("x1")).toBe(String(CLEAREST_SPOT_GAUGE_CENTER_X));
      expect(needle.getAttribute("y1")).toBe(String(CLEAREST_SPOT_GAUGE_CENTER_Y));
      expect(Number(needle.getAttribute("x2"))).toBeCloseTo(marker.x, 5);
      expect(Number(needle.getAttribute("y2"))).toBeCloseTo(marker.y, 5);

      if (score <= 0) {
        expect(screen.queryByTestId("clearest-spot-gauge-active-arc")).not.toBeInTheDocument();
      } else {
        expect(screen.getByTestId("clearest-spot-gauge-active-arc")).toBeInTheDocument();
      }

      if (score >= 100) {
        expect(screen.queryByTestId("clearest-spot-gauge-inactive-arc")).not.toBeInTheDocument();
      } else {
        expect(screen.getByTestId("clearest-spot-gauge-inactive-arc")).toBeInTheDocument();
      }
    },
  );

  it("renders Low and Best labels below the arc", () => {
    render(<ClearestSpotGauge score={60} />);

    const labels = screen.getByTestId("clearest-spot-gauge-labels");
    expect(within(labels).getByText("Low")).toBeInTheDocument();
    expect(within(labels).getByText("Best")).toBeInTheDocument();
    expect(labels.className).toContain("justify-between");
  });

  it("keeps the gauge clipped inside a bounded mobile frame", () => {
    render(<ClearestSpotGauge score={60} />);

    const container = screen.getByTestId("clearest-spot-gauge");
    const frame = screen.getByTestId("clearest-spot-gauge-frame");
    const svg = screen.getByTestId("clearest-spot-gauge-svg");

    expect(container.className).toBe(clearestSpotGaugeContainerClass);
    expect(container.className).toContain("max-sm:overflow-hidden");
    expect(frame.className).toBe(clearestSpotGaugeFrameClass);
    expect(frame.className).toContain("max-sm:h-12");
    expect(svg).toHaveAttribute("data-viewbox-height", String(CLEAREST_SPOT_GAUGE_VIEWBOX.height));
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMax meet");
    expect(svg.querySelector("#clearest-spot-gauge-clip")).not.toBeNull();
    expect(container.contains(frame)).toBe(true);
  });
});
