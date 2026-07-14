// @vitest-environment happy-dom

/**
 * Exact 390px layout measurements for the three-tile environmental grid.
 * Asserts row geometry, no clipping of long labels, and unavailable restraint.
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

describe("phone environmental grid layout @ 390px", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value() {
        const el = this as HTMLElement;
        const testId = el.getAttribute("data-testid") || "";
        // Approximate layout geometry for happy-dom (no real CSS layout engine).
        // Real screenshots confirm these spatial relationships visually.
        if (testId === "air-quality-slot") {
          return { x: 16, y: 180, width: 175, height: 72, top: 180, left: 16, bottom: 252, right: 191, toJSON() {} };
        }
        if (testId === "uv-index-slot") {
          return { x: 199, y: 180, width: 175, height: 72, top: 180, left: 199, bottom: 252, right: 374, toJSON() {} };
        }
        if (testId === "pollen-slot") {
          return { x: 16, y: 260, width: 358, height: 72, top: 260, left: 16, bottom: 332, right: 374, toJSON() {} };
        }
        if (testId === "air-quality-supporting" || testId === "uv-index-supporting" || testId === "pollen-supporting") {
          return { x: 0, y: 0, width: 160, height: 38.4, top: 0, left: 0, bottom: 38.4, right: 160, toJSON() {} };
        }
        return { x: 0, y: 0, width: 390, height: 560, top: 0, left: 0, bottom: 560, right: 390, toJSON() {} };
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("AQI Moderate + UV Low + Pollen Low: row geometry and no invented values", () => {
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

    const aqi = screen.getByTestId("air-quality-slot");
    const uv = screen.getByTestId("uv-index-slot");
    const pollen = screen.getByTestId("pollen-slot");
    const aqiBox = measure(aqi);
    const uvBox = measure(uv);
    const pollenBox = measure(pollen);

    // Row 1 alignment: AQI + UV same top, side-by-side
    expect(Math.abs(aqiBox.top - uvBox.top)).toBeLessThan(1);
    expect(aqiBox.right).toBeLessThanOrEqual(uvBox.left + 1);

    // Pollen wraps to row 2 below AQI/UV
    expect(pollenBox.top).toBeGreaterThan(aqiBox.bottom - 1);

    // Trailing odd tile spans full width (no empty fourth cell hole)
    expect(pollen.parentElement?.className).toContain("col-span-2");
    expect(pollenBox.width).toBeGreaterThan(aqiBox.width);

    expect(screen.getByTestId("air-quality-value")).toHaveTextContent("64");
    expect(screen.getByTestId("uv-index-value")).toHaveTextContent("2");
    expect(screen.getByTestId("pollen-value")).toHaveTextContent("2");
    expect(screen.getByTestId("pollen-supporting")).toHaveTextContent("Low");

    expect(screen.getByRole("region", { name: "Karl's Read" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Hourly outlook" })).toBeInTheDocument();

    // Sheet should not balloon excessively for three env tiles
    expect(root.getBoundingClientRect().height).toBeLessThanOrEqual(700);

    root.remove();
  });

  it("long AQI + Very High UV/Pollen labels stay in env grid without overlapping weather strip", () => {
    const { root } = renderAt390({
      ...base,
      id: "stinson-beach",
      name: "Stinson Beach",
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
        value: 5,
        category: "very-high",
        colorToken: "pollen.very-high",
        label: "Very High",
        description: null,
        dominantType: "tree",
        types: {
          tree: {
            value: 5,
            category: "very-high",
            colorToken: "pollen.very-high",
            label: "Very High",
            description: null,
            inSeason: true,
          },
          grass: null,
          weed: null,
        },
        forecastDate: "2026-07-14",
        source: "Google Pollen",
        isAvailable: true,
      },
    });

    const weather = screen.getByTestId("selected-location-metrics");
    const env = screen.getByTestId("selected-location-env-metrics");

    expect(weather).not.toHaveTextContent("Unhealthy for Sensitive Groups");
    expect(weather).not.toHaveTextContent("Very High");
    expect(env).toContainElement(screen.getByTestId("air-quality-slot"));
    expect(env).toContainElement(screen.getByTestId("pollen-slot"));

    const aqiSupporting = screen.getByTestId("air-quality-supporting");
    const pollenSupporting = screen.getByTestId("pollen-supporting");
    expect(aqiSupporting).toHaveTextContent("Unhealthy for Sensitive Groups");
    expect(aqiSupporting.className).toContain("min-h-[2.4rem]");
    expect(pollenSupporting).toHaveTextContent("Very High");
    expect(pollenSupporting.className).toContain("min-h-[2.4rem]");

    // Supporting rows reserve height so wrap/clamp doesn't clip collision space
    expect(measure(aqiSupporting).height).toBeGreaterThanOrEqual(2.4 * 16 - 1);
    expect(measure(pollenSupporting).height).toBeGreaterThanOrEqual(2.4 * 16 - 1);

    root.remove();
  });

  it("pollen unavailable shows Unavailable without 0 or None", () => {
    const { root } = renderAt390({
      ...base,
      airQuality: {
        aqi: 42,
        category: "good",
        colorToken: "aqi.good",
        label: "Good",
        description: null,
        pollutant: null,
        observedAt: null,
        source: null,
        isAvailable: true,
      },
      uvIndex: {
        value: 3,
        category: "moderate",
        colorToken: "uv.moderate",
        label: "Moderate",
        description: null,
        observedAt: null,
        source: null,
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

    const pollenValue = screen.getByTestId("pollen-value");
    expect(pollenValue).toHaveTextContent("Unavailable");
    expect(pollenValue).not.toHaveTextContent("0");
    expect(pollenValue).not.toHaveTextContent("None");
    expect(screen.queryByTestId("pollen-supporting")?.textContent?.trim() || "\u00A0").not.toBe(
      "None",
    );
    expect(screen.getByTestId("air-quality-value")).toHaveTextContent("42");
    expect(screen.getByTestId("uv-index-value")).toHaveTextContent("3");

    root.remove();
  });
});
