// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardGrid } from "@/components/home/DashboardGrid";

describe("DashboardGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders condition icons alongside dashboard metrics", () => {
    const { container } = render(
      <DashboardGrid
        current={{
          id: "bay-area-current",
          summary: "Foggy",
          status: "Foggy",
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
        }}
        bestSunshine={{
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
        }}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Fog Coverage")).toBeInTheDocument();
    expect(screen.getByText("Karl Status")).toBeInTheDocument();
    expect(container.querySelectorAll("svg")).toHaveLength(4);
  });
});
