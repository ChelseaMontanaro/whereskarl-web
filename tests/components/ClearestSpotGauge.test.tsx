// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  ClearestSpotGauge,
  CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX,
  CLEAREST_SPOT_GAUGE_LABEL_Y,
  CLEAREST_SPOT_GAUGE_INSTRUMENT_TRANSLATE_Y,
  CLEAREST_SPOT_GAUGE_PRESENTATION_SCALE_Y,
  CLEAREST_SPOT_GAUGE_PRESENTATION_TRANSLATE_Y,
  clearestSpotGaugeContainerClass,
  clearestSpotGaugeFrameClass,
  clearestSpotGaugeInstrumentTransform,
  clearestSpotGaugePresentationTransform,
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
    expect(lowLabel.getAttribute("y")).toBe(String(CLEAREST_SPOT_GAUGE_LABEL_Y));
    expect(bestLabel.getAttribute("y")).toBe(String(CLEAREST_SPOT_GAUGE_LABEL_Y));
    expect(Number(lowLabel.getAttribute("y"))).toBeGreaterThan(CLEAREST_SPOT_GAUGE_CENTER_Y);
  });

  it("uses a bounded fixed mobile gauge frame height", () => {
    render(<ClearestSpotGauge score={60} />);

    const container = screen.getByTestId("clearest-spot-gauge");
    const frame = screen.getByTestId("clearest-spot-gauge-frame");

    expect(container.className).toBe(clearestSpotGaugeContainerClass);
    expect(container.className).toContain("max-sm:shrink-0");
    expect(container.className).not.toContain("max-sm:flex-1");
    expect(frame.className).toBe(clearestSpotGaugeFrameClass);
    expect(frame.className).toContain("max-sm:h-[2.375rem]");
    expect(frame.className).toContain("max-sm:w-full");
    expect(frame.className).not.toContain("aspect-");
  });

  it("flattens the arc presentation so the curve stays below the card text", () => {
    render(<ClearestSpotGauge score={60} />);

    const container = screen.getByTestId("clearest-spot-gauge");
    const frame = screen.getByTestId("clearest-spot-gauge-frame");
    const svg = screen.getByTestId("clearest-spot-gauge-svg");
    const arcGroup = screen.getByTestId("clearest-spot-gauge-arc-group");
    const instrumentGroup = screen.getByTestId("clearest-spot-gauge-instrument-group");

    expect(container.className).not.toMatch(/-mt-/);
    expect(container.className).not.toContain("max-sm:pl-4");
    expect(frame.className).toContain("max-sm:overflow-hidden");
    expect(svg).toHaveAttribute(
      "data-viewbox-width",
      String(CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.width),
    );
    expect(svg).toHaveAttribute(
      "data-viewbox-height",
      String(CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.height),
    );
    expect(svg).toHaveAttribute(
      "data-viewbox-min-y",
      String(CLEAREST_SPOT_GAUGE_DISPLAY_VIEWBOX.minY),
    );
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMax slice");
    expect(svg).toHaveAttribute(
      "data-instrument-translate-y",
      String(CLEAREST_SPOT_GAUGE_INSTRUMENT_TRANSLATE_Y),
    );
    expect(svg).toHaveAttribute(
      "data-presentation-translate-y",
      String(CLEAREST_SPOT_GAUGE_PRESENTATION_TRANSLATE_Y),
    );
    expect(svg.getAttribute("data-presentation-scale-y")).toBe(
      String(CLEAREST_SPOT_GAUGE_PRESENTATION_SCALE_Y),
    );
    expect(instrumentGroup.getAttribute("transform")).toBe(clearestSpotGaugeInstrumentTransform());
    expect(arcGroup.getAttribute("transform")).toBe(clearestSpotGaugePresentationTransform());
    expect(svg.querySelector("#clearest-spot-gauge-active-gradient")).not.toBeNull();
    expect(container.contains(instrumentGroup)).toBe(true);
    expect(instrumentGroup.contains(arcGroup)).toBe(true);
    expect(instrumentGroup.contains(screen.getByTestId("clearest-spot-gauge-label-low"))).toBe(
      true,
    );
  });
});
