// @vitest-environment happy-dom

/**
 * 390px layout checks for the Environmental Metrics 3×2 grid
 * (AQI · UV · Pollen / Humidity · Visibility · KHI) and the shared
 * Marine Layer | Fog Ceiling card.
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

describe("phone environmental metrics 3×2 @ 390px", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value() {
        const el = this as HTMLElement;
        const testId = el.getAttribute("data-testid") || "";
        // Approximate equal 3-up tile geometry for happy-dom (~110px + gaps).
        const row1 = 180;
        const row2 = 290;
        const slots: Record<string, { x: number; y: number; width: number }> = {
          "air-quality-slot": { x: 12, y: row1, width: 110 },
          "uv-index-slot": { x: 130, y: row1, width: 110 },
          "pollen-slot": { x: 248, y: row1, width: 110 },
          "humidity-slot": { x: 12, y: row2, width: 110 },
          "visibility-slot": { x: 130, y: row2, width: 110 },
          "karl-health-slot": { x: 248, y: row2, width: 110 },
          "selected-location-marine-card": { x: 12, y: 380, width: 348 },
          "marine-layer-slot": { x: 12, y: 380, width: 174 },
          "fog-ceiling-slot": { x: 186, y: 380, width: 174 },
        };
        const slot = slots[testId];
        if (slot) {
          return {
            x: slot.x,
            y: slot.y,
            width: slot.width,
            height: testId.includes("marine") || testId.includes("fog-ceiling") || testId.includes("marine-card")
              ? 84
              : 102,
            top: slot.y,
            left: slot.x,
            bottom: slot.y + (testId.includes("marine") || testId.includes("fog-ceiling") || testId.includes("marine-card") ? 84 : 102),
            right: slot.x + slot.width,
            toJSON() {},
          };
        }
        if (testId.endsWith("-supporting")) {
          return {
            x: 0,
            y: 0,
            width: 110,
            height: 38.4,
            top: 0,
            left: 0,
            bottom: 38.4,
            right: 110,
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

  it("places the six Environmental Metrics tiles in a 3×2 grid", () => {
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
    const grid = screen.getByTestId("selected-location-env-grid");
    expect(env).toHaveTextContent("Environmental Metrics");
    expect(grid.className).toContain("grid-cols-3");
    expect(grid.className).not.toContain("grid-cols-4");

    const aqi = measure(screen.getByTestId("air-quality-slot"));
    const uv = measure(screen.getByTestId("uv-index-slot"));
    const pollen = measure(screen.getByTestId("pollen-slot"));
    const humidity = measure(screen.getByTestId("humidity-slot"));
    const visibility = measure(screen.getByTestId("visibility-slot"));
    const khi = measure(screen.getByTestId("karl-health-slot"));

    // Row 1 shared top; row 2 below
    expect(Math.abs(aqi.top - uv.top)).toBeLessThan(1);
    expect(Math.abs(aqi.top - pollen.top)).toBeLessThan(1);
    expect(Math.abs(humidity.top - visibility.top)).toBeLessThan(1);
    expect(Math.abs(humidity.top - khi.top)).toBeLessThan(1);
    expect(humidity.top).toBeGreaterThan(aqi.bottom - 1);

    // Left-to-right without overlap on each row
    expect(aqi.right).toBeLessThanOrEqual(uv.left + 1);
    expect(uv.right).toBeLessThanOrEqual(pollen.left + 1);
    expect(humidity.right).toBeLessThanOrEqual(visibility.left + 1);
    expect(visibility.right).toBeLessThanOrEqual(khi.left + 1);

    // Equal-ish third widths
    expect(Math.abs(aqi.width - pollen.width)).toBeLessThan(8);
    expect(Math.abs(humidity.width - khi.width)).toBeLessThan(8);
    expect(pollen.width).toBeLessThan(140);

    expect(screen.getByTestId("humidity-value")).toHaveTextContent("72%");
    expect(screen.getByTestId("visibility-value")).toHaveTextContent("6 mi");
    expect(screen.getByTestId("karl-health-value")).toHaveTextContent(
      "Coming Soon",
    );
    expect(screen.getByLabelText("Karl Health Index, Coming Soon")).toBeInTheDocument();
    expect(screen.queryByText("Fog & Marine")).not.toBeInTheDocument();

    expect(screen.getByRole("region", { name: "Karl's Read" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Hourly outlook" }),
    ).toBeInTheDocument();

    root.remove();
  });

  it("keeps long AQI labels inside their tile without inventing humidity/KHI labels", () => {
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
    expect(aqiSupporting).toHaveTextContent("Sensitive");
    expect(aqiSupporting).not.toHaveTextContent(
      "Unhealthy for Sensitive Groups",
    );
    expect(aqiSupporting.className).toContain("truncate");
    expect(aqiSupporting.className).toContain("min-h-[0.95rem]");
    expect(
      screen.getByLabelText("AQI, 125, Unhealthy for Sensitive Groups"),
    ).toBeInTheDocument();

    // Equal tile heights — AQI must not grow taller than UV / Pollen neighbors.
    const aqiH = measure(screen.getByTestId("air-quality-slot")).height;
    const uvH = measure(screen.getByTestId("uv-index-slot")).height;
    const pollenH = measure(screen.getByTestId("pollen-slot")).height;
    expect(Math.abs(aqiH - uvH)).toBeLessThan(1);
    expect(Math.abs(aqiH - pollenH)).toBeLessThan(1);

    expect(screen.getByTestId("pollen-value")).toHaveTextContent("Unavailable");
    expect(screen.getByTestId("karl-health-value")).toHaveTextContent(
      "Coming Soon",
    );
    expect(screen.getByTestId("selected-location-env-metrics")).not.toHaveTextContent(
      "Comfortable",
    );

    root.remove();
  });

  it("renders Marine Layer and Fog Ceiling as one shared card with equal halves", () => {
    const { root } = renderAt390(base);

    fireEvent.click(screen.getByRole("button", { name: "Expand details" }));

    const marineCard = screen.getByTestId("selected-location-marine-card");
    const marine = measure(screen.getByTestId("marine-layer-slot"));
    const ceiling = measure(screen.getByTestId("fog-ceiling-slot"));

    expect(marineCard.className).toContain("rounded-xl");
    expect(marineCard.className).toContain("min-h-[5.25rem]");
    expect(Math.abs(marine.width - ceiling.width)).toBeLessThan(8);
    expect(marine.right).toBeLessThanOrEqual(ceiling.left + 1);
    expect(marine.height).toBeGreaterThanOrEqual(52);
    expect(screen.getByTestId("marine-layer-value")).toHaveTextContent(
      "Coming Soon",
    );
    expect(screen.getByTestId("fog-ceiling-value")).toHaveTextContent(
      "Coming Soon",
    );
    expect(
      screen.getByTestId("selected-location-env-metrics"),
    ).not.toContainElement(marineCard);

    root.remove();
  });
});
