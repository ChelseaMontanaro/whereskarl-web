// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FogCoverageIcon,
  FogMistIcon,
  SunshineIcon,
} from "@/components/home/ConditionIcons";
import { DashboardGrid } from "@/components/home/DashboardGrid";
import { MetricDetailSheet } from "@/components/home/MetricDetailSheet";
import { METRIC_DETAILS } from "@/lib/home/metricDetails";
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

  it("uses larger phone portrait metric tile sizing scoped to max-sm", () => {
    const { container } = render(
      <DashboardGrid
        current={currentFixture}
        bestSunshine={bestSunshineFixture}
        isLoading={false}
      />,
    );

    const dashboard = container.querySelector('[aria-label="Bay Area conditions dashboard"]');
    expect(dashboard?.className).toContain("max-sm:gap-3");

    const metricSurfaces = container.querySelectorAll(".max-sm\\:min-h-\\[7\\.25rem\\]");
    expect(metricSurfaces.length).toBe(4);
    expect(container.querySelector(".max-sm\\:text-\\[1\\.65rem\\]")).toBeTruthy();
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
    expect(container.querySelectorAll("svg")).toHaveLength(4);
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
