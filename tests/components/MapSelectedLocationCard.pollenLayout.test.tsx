// @vitest-environment happy-dom

/**
 * 390px layout checks for the single Environmental Metrics row
 * (AQI · UV · Pollen · EHI).
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import type { LocationWeather } from "@/lib/schemas/weather";

const base: LocationWeather = {
  id: "tiburon",
  name: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  status: "Partly Cloudy",
  temperature: 66,
  sunshineScore: 48,
  distanceText: "8 mi",
  cloudCover: 48,
  visibility: 6,
  humidity: 72,
  windSpeed: 8,
  windDirection: "WNW",
  weatherCode: 2,
  iconName: "cloud.sun.fill",
  fogScore: 38,
  karlReason:
    "Light marine layer lingering along the shoreline — expect gradual clearing by early afternoon.",
  primaryDrivers: [],
  microclimateFactors: [],
  updatedAt: "2026-07-14T14:00:00.000Z",
  confidenceScore: 80,
  confidenceLabel: "High",
  confidenceExplanation: "Fresh fused observations.",
  confidenceComponents: {
    freshness: 80,
    observationQuality: 80,
    fieldCompleteness: 80,
    sourceReliability: 80,
  },
  prediction: {
    predictionConfidenceScore: 70,
    predictionConfidenceLabel: "Medium",
    predictionReason: "Holding steady.",
  },
};

function measure(el: HTMLElement) {
  return el.getBoundingClientRect();
}

function renderAt390(location: LocationWeather) {
  const root = document.createElement("div");
  root.style.width = "390px";
  root.style.maxWidth = "390px";
  root.style.position = "relative";
  document.body.appendChild(root);

  const view = render(
    <MapSelectedLocationCard
      location={location}
      phonePortrait
      showCloseButton={false}
    />,
    { container: root },
  );

  return { root, ...view };
}

describe("phone environmental metrics row @ 390px", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value() {
        const el = this as HTMLElement;
        const testId = el.getAttribute("data-testid") || "";
        // Approximate equal 4-up geometry for happy-dom (~87px tiles + gaps).
        const tops = 180;
        const slots: Record<string, { x: number; width: number }> = {
          "air-quality-slot": { x: 12, width: 87 },
          "uv-index-slot": { x: 107, width: 87 },
          "pollen-slot": { x: 202, width: 87 },
          "environmental-health-slot": { x: 297, width: 87 },
        };
        const slot = slots[testId];
        if (slot) {
          return {
            x: slot.x,
            y: tops,
            width: slot.width,
            height: 78,
            top: tops,
            left: slot.x,
            bottom: tops + 78,
            right: slot.x + slot.width,
            toJSON() {},
          };
        }
        if (testId.endsWith("-supporting")) {
          return {
            x: 0,
            y: 0,
            width: 87,
            height: 41.6,
            top: 0,
            left: 0,
            bottom: 41.6,
            right: 87,
            toJSON() {},
          };
        }
        return {
          x: 0,
          y: 0,
          width: 390,
          height: 560,
          top: 0,
          left: 0,
          bottom: 560,
          right: 390,
          toJSON() {},
        };
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("places AQI, UV, Pollen, and EHI in one equal row", () => {
    const { root } = renderAt390({
      ...base,
      airQuality: {
        aqi: 64,
        category: "moderate",
        colorToken: "aqi.moderate",
        label: "Moderate",
        description: null,
        pollutant: "PM2.5",
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      uvIndex: {
        value: 2,
        category: "low",
        colorToken: "uv.low",
        label: "Low",
        description: null,
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      pollen: {
        value: 2,
        category: "low",
        colorToken: "pollen.low",
        label: "Low",
        description: null,
        dominantType: "grass",
        types: {
          tree: null,
          grass: {
            value: 2,
            category: "low",
            colorToken: "pollen.low",
            label: "Low",
            description: null,
            inSeason: true,
          },
          weed: null,
        },
        forecastDate: "2026-07-14",
        source: "Google Pollen",
        isAvailable: true,
      },
    });

    const env = screen.getByTestId("selected-location-env-metrics");
    const aqi = screen.getByTestId("air-quality-slot");
    const uv = screen.getByTestId("uv-index-slot");
    const pollen = screen.getByTestId("pollen-slot");
    const health = screen.getByTestId("environmental-health-slot");

    expect(env.querySelector(".grid-cols-4")).not.toBeNull();
    expect(env.querySelector(".col-span-2")).toBeNull();

    const aqiBox = measure(aqi);
    const uvBox = measure(uv);
    const pollenBox = measure(pollen);
    const healthBox = measure(health);

    // Single row — shared top edge
    expect(Math.abs(aqiBox.top - uvBox.top)).toBeLessThan(1);
    expect(Math.abs(aqiBox.top - pollenBox.top)).toBeLessThan(1);
    expect(Math.abs(aqiBox.top - healthBox.top)).toBeLessThan(1);

    // Left-to-right order without overlap
    expect(aqiBox.right).toBeLessThanOrEqual(uvBox.left + 1);
    expect(uvBox.right).toBeLessThanOrEqual(pollenBox.left + 1);
    expect(pollenBox.right).toBeLessThanOrEqual(healthBox.left + 1);

    // Equal-ish quarter widths (not a full-width pollen row)
    expect(Math.abs(aqiBox.width - pollenBox.width)).toBeLessThan(8);
    expect(pollenBox.width).toBeLessThan(120);

    expect(screen.getByTestId("pollen-value")).toHaveTextContent("2");
    expect(screen.getByTestId("environmental-health-value")).toHaveTextContent(
      "Coming Soon",
    );
    expect(
      screen.getByLabelText("Environmental Health Index"),
    ).toBeInTheDocument();

    expect(screen.getByRole("region", { name: "Karl's Read" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Hourly outlook" }),
    ).toBeInTheDocument();

    root.remove();
  });

  it("keeps long AQI labels inside their tile without inventing pollen/health values", () => {
    const { root } = renderAt390({
      ...base,
      airQuality: {
        aqi: 125,
        category: "unhealthy-sensitive",
        colorToken: "aqi.unhealthy-sensitive",
        label: "Unhealthy for Sensitive Groups",
        description: null,
        pollutant: "Ozone",
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      uvIndex: {
        value: 9,
        category: "very-high",
        colorToken: "uv.very-high",
        label: "Very High",
        description: null,
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      pollen: {
        value: null,
        category: null,
        colorToken: "pollen.unavailable",
        label: "Unavailable",
        description: null,
        dominantType: null,
        types: { tree: null, grass: null, weed: null },
        forecastDate: null,
        source: null,
        isAvailable: false,
      },
    });

    const weather = screen.getByTestId("selected-location-metrics");
    expect(weather).not.toHaveTextContent("Unhealthy for Sensitive Groups");

    const aqiSupporting = screen.getByTestId("air-quality-supporting");
    expect(aqiSupporting).toHaveTextContent("Unhealthy for Sensitive Groups");
    expect(aqiSupporting.className).toContain("min-h-[2.6rem]");
    expect(measure(aqiSupporting).height).toBeGreaterThanOrEqual(2.6 * 16 - 1);

    const pollenValue = screen.getByTestId("pollen-value");
    expect(pollenValue).toHaveTextContent("Unavailable");
    expect(pollenValue).not.toHaveTextContent("0");
    expect(pollenValue).not.toHaveTextContent("None");

    expect(screen.getByTestId("environmental-health-value")).toHaveTextContent(
      "Coming Soon",
    );

    root.remove();
  });
});
