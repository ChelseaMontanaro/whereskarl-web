// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FogCoverageIcon,
  FogMistIcon,
  SunshineIcon,
} from "@/components/home/ConditionIcons";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { MetricDetailSheet } from "@/components/home/MetricDetailSheet";
import {
  clearSkiesIndicatorAriaLabel,
  fogCoverageIndicatorAriaLabel,
  metricPercentFillWidth,
} from "@/lib/home/metricPercent";
import { clearestSpotGaugeAriaLabel } from "@/lib/home/clearestSpotGauge";
import { fogCoverageSliderFillWidth } from "@/lib/home/fogCoverageIndicator";
import { METRIC_DETAILS } from "@/lib/home/metricDetails";
import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";
import type { BestSunshineResponse, CurrentResponse } from "@/lib/schemas/weather";

const currentFixture: CurrentResponse = {
  id: "bay-area-current",
  summary: "Foggy",
  status: "Karl is lingering",
  temperature: 58,
  fogCoverage: 56,
  sunshineScore: 44,
  windSpeed: 8,
  windDirection: "W",
  cloudCover: 70,
  visibility: 6,
  humidity: 82,
  weatherCode: 45,
  iconName: "cloud.fog.fill",
  updatedAt: "2026-07-01T16:00:00.000Z",
  source: "live",
  confidenceScore: 0.8,
  confidenceLabel: "High confidence",
  confidenceExplanation: "Live data",
  confidenceComponents: {
    freshness: 0.8,
    observationQuality: 0.8,
    fieldCompleteness: 0.8,
    sourceReliability: 0.8,
  },
};

const bestSunshineFixture: BestSunshineResponse = {
  id: "best-sunshine",
  locationID: "tiburon",
  locationName: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  status: "Mostly Sunny",
  temperature: 68,
  sunshineScore: 82,
  fogScore: 26,
  distanceText: "8 mi",
  reason: "Clear skies",
  iconName: "sun.max.fill",
  updatedAt: "2026-07-01T16:00:00.000Z",
  source: "live",
  recommendationMode: "current",
  lookaheadMinutes: 0,
  recommendationScore: 82,
  projectedSunshineScore1h: null,
  recommendationReason: "Clear skies",
  confidenceScore: 0.8,
  confidenceLabel: "High confidence",
  confidenceExplanation: "Live data",
  confidenceComponents: {
    freshness: 0.8,
    observationQuality: 0.8,
    fieldCompleteness: 0.8,
    sourceReliability: 0.8,
  },
};

describe("DashboardGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses translucent smoky-black glass on metric cards instead of opaque navy", () => {
    const { container } = render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    const metricCards = container.querySelectorAll(
      '[aria-label="Bay Area conditions dashboard"] > * > .rounded-2xl',
    );

    expect(metricCards.length).toBe(4);

    for (const card of metricCards) {
      expect(card.className).toMatch(/bg-black\/40/);
      expect(card.className).toMatch(/lg:bg-black\/34/);
      expect(card.className).toMatch(/backdrop-blur-md/);
      expect(card.className).not.toMatch(/karl-navy-glass/);
    }
  });

  it("uses balanced phone portrait metric tile sizing scoped to max-sm", () => {
    const { container } = render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    const dashboard = container.querySelector('[aria-label="Bay Area conditions dashboard"]');
    expect(dashboard?.className).toContain("max-sm:gap-3");

    const metricSurfaces = container.querySelectorAll(".max-sm\\:min-h-\\[9\\.25rem\\]");
    expect(metricSurfaces.length).toBe(4);
    expect(container.querySelector(".max-sm\\:text-\\[1\\.95rem\\]")).toBeTruthy();
  });

  it("prefers intelligence headline status over the generic Karl is here fallback", () => {
    const intelligence = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(process.cwd(), "tests/fixtures/karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );

    render(
      <DashboardGrid
        current={{ ...currentFixture, status: "Karl is here" }}
        bestSunshine={bestSunshineFixture}
        intelligence={intelligence}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Karl is picking favorites across the Bay")).toBeInTheDocument();
    expect(screen.queryByText("Karl is here")).not.toBeInTheDocument();
  });

  it("uses the generic Karl is here fallback only when no intelligence status is available", () => {
    render(
      <DashboardGrid
        current={{ ...currentFixture, status: "Karl is here" }}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Karl is here")).toBeInTheDocument();
  });

  it("uses a smaller phrase-sized mobile value for Karl Status than numeric metric tiles", () => {
    const statusFixture: CurrentResponse = {
      ...currentFixture,
      status: "Karl is lingering",
    };

    render(
      <DashboardGrid
        current={statusFixture}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    const fogCoverageValue = screen.getByText("56%");
    const karlStatusValue = screen.getByText("Karl is lingering");
    const sunshineScoreValue = screen.getByText("44");

    expect(fogCoverageValue.className).toContain("max-sm:text-[1.95rem]");
    expect(sunshineScoreValue.className).toContain("max-sm:text-[1.95rem]");
    expect(fogCoverageValue.className).not.toContain("max-sm:!text-[1.5625rem]");
    expect(sunshineScoreValue.className).not.toContain("max-sm:!text-[1.5625rem]");
    expect(karlStatusValue.className).toContain("max-sm:!text-[1.5625rem]");
    expect(karlStatusValue.className).toContain("max-sm:!line-clamp-3");
    expect(karlStatusValue.className).toContain("max-sm:leading-snug");
    expect(karlStatusValue.className).toContain("max-sm:min-h-[4.75rem]");
    expect(karlStatusValue.className).toContain("max-sm:max-h-[4.75rem]");
  });

  it("keeps Karl Status card height stable when the phrase wraps to three lines", () => {
    const { container } = render(
      <DashboardGrid
        current={{ ...currentFixture, status: "Patchy fog nearby" }}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    const karlStatusValue = screen.getByText("Patchy fog nearby");
    expect(karlStatusValue.className).toContain("max-sm:!line-clamp-3");

    const karlStatusCard = screen
      .getByRole("button", { name: "Learn about Karl Status" })
      .querySelector(".rounded-2xl");
    expect(karlStatusCard?.className).toContain("max-sm:h-[9.25rem]");

    const metricCards = container.querySelectorAll(
      '[aria-label="Bay Area conditions dashboard"] > * > .rounded-2xl, [aria-label="Bay Area conditions dashboard"] > * > a > .rounded-2xl',
    );
    for (const card of metricCards) {
      expect(card.className).toContain("max-sm:h-[9.25rem]");
    }
  });

  it("preserves two-line mobile headings for Clear Skies Score and Clearest Spot", () => {
    render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    const twoLineLabels = screen.getAllByTestId("two-line-metric-label");
    expect(twoLineLabels).toHaveLength(2);
    expect(within(twoLineLabels[0]).getByText("Clear Skies")).toBeInTheDocument();
    expect(within(twoLineLabels[0]).getByText("Score")).toBeInTheDocument();
    expect(within(twoLineLabels[1]).getByText("Clearest")).toBeInTheDocument();
    expect(within(twoLineLabels[1]).getByText("Spot")).toBeInTheDocument();
  });

  it("renders a mobile-only fog coverage slider only on the Fog Coverage tile", () => {
    const { container } = render(
      <DashboardGrid
        current={{ ...currentFixture, fogCoverage: 56 }}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    expect(
      screen.getByRole("img", { name: fogCoverageIndicatorAriaLabel(56) }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("img", { name: /Fog coverage:/ })).toHaveLength(1);

    const slider = screen.getByTestId("fog-coverage-slider");
    expect(slider.className).toContain("max-sm:block");
    expect(slider.className).toContain("hidden");
    expect(slider.className).toContain("w-full");
    expect(screen.getByTestId("fog-coverage-slider-track").className).toContain("w-full");
    expect(within(slider).getByText("Clear")).toBeInTheDocument();
    expect(within(slider).getByText("Thick")).toBeInTheDocument();

    const labels = screen.getByTestId("fog-coverage-slider-labels");
    expect(labels.className).toContain("justify-between");
    expect(labels.className).toContain("w-full");

    const fill = screen.getByTestId("fog-coverage-slider-track");
    const knob = screen.getByTestId("fog-coverage-slider-knob");
    expect(fill.getAttribute("data-fill-percent")).toBe("56");
    expect(knob.style.left).toBe(fogCoverageSliderFillWidth(56));

    const bayAreaDetail = screen.getByText("Bay Area");
    expect(bayAreaDetail.parentElement?.contains(slider)).toBe(false);

    const fogCoverageButton = screen.getByRole("button", {
      name: "Learn about Fog Coverage",
    });
    expect(fogCoverageButton.contains(slider)).toBe(true);
    expect(
      screen.getByRole("button", { name: "Learn about Karl Status" }).contains(slider),
    ).toBe(false);
    expect(container.querySelectorAll('[data-testid="fog-coverage-slider"]')).toHaveLength(1);
  });

  it.each([
    [0, "0%"],
    [25, "25%"],
    [56, "56%"],
    [75, "75%"],
    [100, "100%"],
  ])(
    "positions the fog coverage slider fill and knob at %i percent",
    (percent, expectedWidth) => {
      render(
        <DashboardGrid
          current={{ ...currentFixture, fogCoverage: percent }}
          bestSunshine={bestSunshineFixture}
          isLoading={false}
        />,
      );

      expect(screen.getByTestId("fog-coverage-slider-track").getAttribute("data-fill-percent")).toBe(
        String(percent),
      );
      expect(screen.getByTestId("fog-coverage-slider-knob").style.left).toBe(expectedWidth);
      expect(
        screen.getByRole("img", { name: fogCoverageIndicatorAriaLabel(percent) }),
      ).toBeInTheDocument();
    },
  );

  it("does not render mobile metric indicators while metrics are loading", () => {
    render(
      <DashboardGrid
        current={null}
        bestSunshine={null}
        isLoading
      />,
    );

    expect(screen.queryByRole("img", { name: /Fog coverage:/ })).not.toBeInTheDocument();
    expect(screen.queryByTestId("fog-coverage-slider")).not.toBeInTheDocument();
    expect(screen.queryByTestId("clear-skies-slider")).not.toBeInTheDocument();
    expect(screen.queryByTestId("clearest-spot-gauge")).not.toBeInTheDocument();
  });

  it("renders an orange clear skies slider only on the Clear Skies Score tile", () => {
    render(
      <DashboardGrid
        current={{ ...currentFixture, sunshineScore: 41 }}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    const slider = screen.getByTestId("clear-skies-slider");
    expect(
      screen.getByRole("img", { name: clearSkiesIndicatorAriaLabel(41) }),
    ).toBeInTheDocument();
    expect(within(slider).getByText("Poor")).toBeInTheDocument();
    expect(within(slider).getByText("Excellent")).toBeInTheDocument();
    expect(screen.getByTestId("clear-skies-slider-track").getAttribute("data-fill-percent")).toBe("41");
    expect(screen.getByTestId("clear-skies-slider-knob").style.left).toBe("41%");
    expect(screen.getByTestId("clear-skies-slider-track").style.background).toContain("41%");

    const clearSkiesButton = screen.getByRole("button", {
      name: "Learn about Clear Skies Score",
    });
    expect(clearSkiesButton.contains(slider)).toBe(true);
    expect(
      screen.getByRole("button", { name: "Learn about Fog Coverage" }).contains(slider),
    ).toBe(false);
  });

  it("renders a semicircle gauge only on the Clearest Spot tile", () => {
    render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={{ ...bestSunshineFixture, sunshineScore: 81 }}
        isLoading={false}
      />,
    );

    const gauge = screen.getByTestId("clearest-spot-gauge");
    expect(
      screen.getByRole("img", { name: clearestSpotGaugeAriaLabel(81) }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("clearest-spot-gauge-active-arc")).toBeInTheDocument();
    expect(screen.getByTestId("clearest-spot-gauge-marker")).toBeInTheDocument();
    expect(screen.getByTestId("clearest-spot-gauge-needle")).toBeInTheDocument();
    expect(screen.getByTestId("clearest-spot-gauge-svg")).toHaveAttribute(
      "data-viewbox-height",
      "56",
    );
    expect(screen.getByTestId("clearest-spot-gauge-svg")).toHaveAttribute(
      "data-viewbox-width",
      "100",
    );
    expect(screen.getByTestId("clearest-spot-gauge-svg").getAttribute("preserveAspectRatio")).toBe(
      "xMidYMax meet",
    );
    expect(gauge.className).not.toContain("max-sm:overflow-hidden");
    expect(screen.getByTestId("clearest-spot-gauge-frame").className).toContain("max-sm:w-[84%]");
    expect(screen.getByTestId("clearest-spot-gauge-frame").className).toContain(
      "max-sm:h-[3.5rem]",
    );
    expect(within(gauge).getByText("LOW")).toBeInTheDocument();
    expect(within(gauge).getByText("BEST")).toBeInTheDocument();

    const clearestSpotLink = screen.getByRole("link", {
      name: "View clearest spot on map: Tiburon",
    });
    expect(clearestSpotLink.contains(gauge)).toBe(true);
    expect(
      screen.getByRole("button", { name: "Learn about Clear Skies Score" }).contains(gauge),
    ).toBe(false);
  });

  it("keeps the clearest spot gauge contained inside the Clearest Spot card", () => {
    render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={{ ...bestSunshineFixture, sunshineScore: 81 }}
        isLoading={false}
      />,
    );

    const clearestSpotLink = screen.getByRole("link", {
      name: "View clearest spot on map: Tiburon",
    });
    const gauge = screen.getByTestId("clearest-spot-gauge");
    const frame = screen.getByTestId("clearest-spot-gauge-frame");

    expect(clearestSpotLink.contains(gauge)).toBe(true);
    expect(gauge.contains(frame)).toBe(true);
    expect(gauge.className).not.toContain("max-sm:overflow-hidden");
    expect(frame.className).toContain("max-sm:w-[84%]");
    expect(frame.className).toContain("max-sm:h-[3.5rem]");
    expect(screen.getByTestId("fog-coverage-slider").className).not.toContain("overflow-hidden");
    expect(screen.getByTestId("clear-skies-slider").className).not.toContain("overflow-hidden");
  });

  it("does not change fog or clear skies slider markup when clearest spot uses the gauge", () => {
    render(
      <DashboardGrid
        current={{ ...currentFixture, fogCoverage: 59, sunshineScore: 41 }}
        bestSunshine={{ ...bestSunshineFixture, sunshineScore: 79 }}
        isLoading={false}
      />,
    );

    expect(screen.getByTestId("fog-coverage-slider-track").getAttribute("data-fill-percent")).toBe("59");
    expect(screen.getByTestId("clear-skies-slider-track").getAttribute("data-fill-percent")).toBe("41");
    expect(screen.getByTestId("clearest-spot-gauge-marker")).toBeInTheDocument();
    expect(screen.queryAllByTestId("clearest-spot-gauge")).toHaveLength(1);
    expect(screen.queryAllByTestId("fog-coverage-slider")).toHaveLength(1);
    expect(screen.queryAllByTestId("clear-skies-slider")).toHaveLength(1);
  });

  it.each([
    [20, "20%"],
    [41, "41%"],
    [59, "59%"],
    [80, "80%"],
    [100, "100%"],
  ])(
    "positions clear skies and fog sliders at %i percent",
    (percent, expectedWidth) => {
      render(
        <DashboardGrid
          current={{ ...currentFixture, fogCoverage: percent, sunshineScore: percent }}
          bestSunshine={bestSunshineFixture}
          isLoading={false}
        />,
      );

      expect(screen.getByTestId("fog-coverage-slider-track").getAttribute("data-fill-percent")).toBe(
        String(percent),
      );
      expect(screen.getByTestId("clear-skies-slider-track").getAttribute("data-fill-percent")).toBe(
        String(percent),
      );
      expect(screen.getByTestId("fog-coverage-slider-knob").style.left).toBe(expectedWidth);
      expect(screen.getByTestId("clear-skies-slider-knob").style.left).toBe(expectedWidth);
      expect(metricPercentFillWidth(percent)).toBe(expectedWidth);
      expect(fogCoverageSliderFillWidth(percent)).toBe(expectedWidth);
    },
  );

  it("uses borderless top-right metric icons on phone portrait", () => {
    const { container } = render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    const iconWrappers = container.querySelectorAll('[data-testid="metric-card-icon"]');
    expect(iconWrappers.length).toBe(4);

    for (const iconWrapper of iconWrappers) {
      expect(iconWrapper.className).toContain("max-sm:absolute");
      expect(iconWrapper.className).toContain("max-sm:right-1.5");
      expect(iconWrapper.className).toContain("max-sm:top-1.5");
      expect(iconWrapper.className).toContain("max-sm:border-0");
      expect(iconWrapper.className).toContain("max-sm:rounded-none");
      expect(iconWrapper.className).toContain("lg:rounded-full");
    }

    const iconSvgs = container.querySelectorAll('[data-testid="metric-card-icon"] svg');
    for (const iconSvg of iconSvgs) {
      expect(iconSvg.className).toContain("max-sm:h-8");
      expect(iconSvg.className).toContain("max-sm:w-8");
    }
  });

  it("renders premium weather icons alongside dashboard metrics", () => {
    const { container } = render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Fog Coverage")).toBeInTheDocument();
    expect(screen.getByText("Karl Status")).toBeInTheDocument();
    expect(screen.getByText("Clear Skies Score")).toBeInTheDocument();
    expect(screen.getByText("Clearest Spot")).toBeInTheDocument();
    expect(screen.queryByText("What does this mean?")).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="metric-card-icon"] svg')).toHaveLength(4);
    expect(
      Array.from(container.querySelectorAll('[data-testid="metric-card-icon"] svg')).filter(
        (icon) => icon.className.includes("max-sm:text-karl-gold"),
      ),
    ).toHaveLength(2);
    expect(
      screen.getByRole("link", {
        name: "View clearest spot on map: Tiburon",
      }),
    ).toHaveAttribute("href", "/map?location=tiburon");
  });

  it("opens a metric detail sheet without the removed heading copy", () => {
    render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Learn about Fog Coverage" }));

    const dialog = screen.getByRole("dialog");
    expect(
      screen.getByRole("heading", { level: 2, name: "Fog Coverage" }),
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Fog Coverage");
    expect(dialog).toHaveTextContent(METRIC_DETAILS["fog-coverage"].body);
    expect(within(dialog).queryByText("What does this mean?")).not.toBeInTheDocument();
  });

  it("opens a metric detail sheet for explanatory cards without routing to map", () => {
    render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Learn about Fog Coverage" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(METRIC_DETAILS["fog-coverage"].body);
    expect(screen.queryByRole("link", { name: /Learn about Fog Coverage/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close metric details" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not open detail sheets while metrics are loading", () => {
    render(
      <DashboardGrid
        current={null}
        bestSunshine={null}
        isLoading
      />,
    );

    expect(screen.queryByRole("button", { name: "Learn about Fog Coverage" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Learn about Clear Skies Score" }),
    ).not.toBeInTheDocument();
  });
});

describe("MetricDetailSheet", () => {
  afterEach(() => {
    cleanup();
  });

  it("closes on Escape and exposes accessible dialog semantics", () => {
    const onClose = vi.fn();

    render(<MetricDetailSheet metricKey="sunshine-score" onClose={onClose} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: METRIC_DETAILS["sunshine-score"].title,
      }),
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent(METRIC_DETAILS["sunshine-score"].body);
    expect(screen.queryByText("What does this mean?")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("positions the mobile sheet above the bottom nav with safe-area clearance", () => {
    render(<MetricDetailSheet metricKey="sunshine-score" onClose={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("mb-[calc(4.25rem+env(safe-area-inset-bottom,0px))]");
    expect(dialog.className).toContain(
      "max-h-[min(72dvh,calc(100dvh-5.5rem-env(safe-area-inset-bottom,0px)))]",
    );
    expect(document.body.style.overflow).toBe("hidden");
  });
});

describe("ConditionIcons", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses the shared fog cloud icon for Karl Status and Karl's Read aliases", () => {
    const { container: fog } = render(<FogCoverageIcon />);
    const { container: status } = render(<FogMistIcon />);
    const { container: sun } = render(<SunshineIcon />);

    expect(fog.querySelector("ellipse")).toBeTruthy();
    expect(status.querySelector("ellipse")).toBeTruthy();
    expect(sun.querySelector("circle[fill='currentColor']")).toBeTruthy();
  });
});
