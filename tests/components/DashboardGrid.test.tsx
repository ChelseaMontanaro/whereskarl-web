// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  FogCoverageIcon,
  FogMistIcon,
  SunshineIcon,
} from "@/components/home/ConditionIcons";
import { DashboardGrid } from "@/components/home/DashboardGrid";

describe("DashboardGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders minimal line condition icons alongside dashboard metrics", () => {
    const { container } = render(
      <DashboardGrid
        current={{
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
    expect(screen.getByText("Karl is lingering")).toBeInTheDocument();
    expect(container.querySelectorAll("svg")).toHaveLength(4);
    expect(
      container.querySelector("svg[viewBox='0 0 24 24']"),
    ).toBeInTheDocument();
  });
});

describe("ConditionIcons", () => {
  it("renders refined line icons without illustrated fills", () => {
    const { container: fog } = render(<FogCoverageIcon />);
    const { container: mist } = render(<FogMistIcon />);
    const { container: sun } = render(<SunshineIcon />);

    expect(fog.querySelector("ellipse")).toBeNull();
    expect(mist.querySelector("circle[fill='#162636']")).toBeNull();
    expect(sun.querySelector("path[stroke-linecap='round']")).toBeTruthy();
  });
});
