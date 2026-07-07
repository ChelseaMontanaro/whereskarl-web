// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  ClearestSpotGauge,
  CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX,
  clearestSpotGaugeContainerClass,
  clearestSpotGaugeFrameClass,
} from "@/components/home/ClearestSpotGauge";
import {
  CLEAREST_SPOT_GAUGE_CENTER_X,
  CLEAREST_SPOT_GAUGE_CENTER_Y,
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

  it("renders LOW and BEST labels inside the gauge component", () => {
    render(<ClearestSpotGauge score={60} />);

    const gauge = screen.getByTestId("clearest-spot-gauge");
    const lowLabel = screen.getByTestId("clearest-spot-gauge-label-low");
    const bestLabel = screen.getByTestId("clearest-spot-gauge-label-best");

    expect(gauge.contains(lowLabel)).toBe(true);
    expect(gauge.contains(bestLabel)).toBe(true);
    expect(lowLabel.textContent).toBe("LOW");
    expect(bestLabel.textContent).toBe("BEST");
  });

  it("uses a bounded fixed mobile gauge frame height", () => {
    render(<ClearestSpotGauge score={60} />);

    const container = screen.getByTestId("clearest-spot-gauge");
    const frame = screen.getByTestId("clearest-spot-gauge-frame");

    expect(container.className).toBe(clearestSpotGaugeContainerClass);
    expect(container.className).toContain("max-sm:flex-1");
    expect(frame.className).toBe(clearestSpotGaugeFrameClass);
    expect(frame.className).toContain("max-sm:h-[3.375rem]");
    expect(frame.className).toContain("max-sm:w-full");
    expect(frame.className).not.toContain("aspect-");
  });

  it("does not use negative margin to position the gauge", () => {
    render(<ClearestSpotGauge score={60} />);

    const container = screen.getByTestId("clearest-spot-gauge");
    const frame = screen.getByTestId("clearest-spot-gauge-frame");
    const svg = screen.getByTestId("clearest-spot-gauge-svg");

    expect(container.className).not.toMatch(/-mt-/);
    expect(container.className).toContain("max-sm:!pt-0");
    expect(container.className).toContain("max-sm:pb-0");
    expect(frame.className).not.toContain("max-sm:mx-auto");
    expect(frame.className).toContain("max-sm:overflow-hidden");
    expect(svg).toHaveAttribute(
      "data-viewbox-width",
      String(CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.width),
    );
    expect(svg).toHaveAttribute(
      "data-viewbox-height",
      String(CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.height),
    );
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMax slice");
    expect(svg.querySelector("#clearest-spot-gauge-active-gradient")).not.toBeNull();
    expect(container.contains(frame)).toBe(true);
    expect(container.contains(screen.getByTestId("clearest-spot-gauge-label-low"))).toBe(true);
  });
});
