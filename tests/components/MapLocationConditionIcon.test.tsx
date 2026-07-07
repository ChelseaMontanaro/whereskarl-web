// @vitest-environment happy-dom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapLocationConditionIcon } from "@/components/map/MapLocationConditionIcon";
import type { LocationWeather } from "@/lib/schemas/weather";

const clearLocation: LocationWeather = {
  id: "mountain-view",
  name: "Mountain View",
  latitude: 37.3861,
  longitude: -122.0839,
  status: "Clear",
  temperature: 72,
  sunshineScore: 88,
  distanceText: "12 mi",
  cloudCover: 10,
  visibility: 10,
  humidity: 45,
  windSpeed: 6,
  windDirection: "NW",
  weatherCode: 0,
  iconName: "sun.max.fill",
  fogScore: 12,
  karlReason: "Clear skies across Mountain View.",
  primaryDrivers: [],
  microclimateFactors: [],
  updatedAt: "2026-07-01T16:00:00.000Z",
  confidenceScore: 0,
  confidenceLabel: "Unavailable",
  confidenceExplanation: "Confidence unavailable for demo or fallback data.",
  confidenceComponents: {
    freshness: 0,
    observationQuality: 0,
    fieldCompleteness: 0,
    sourceReliability: 0,
  },
  prediction: {
    predictionConfidenceScore: 0,
    predictionConfidenceLabel: "Unavailable",
    predictionReason: "Prediction is unavailable while Karl is using fallback data.",
  },
};

describe("MapLocationConditionIcon", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("uses a plain gold sun icon on mobile clear locations", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const { container } = render(
      <MapLocationConditionIcon location={clearLocation} />,
    );

    const mobileIcon = container.querySelector(
      '[data-testid="insight-plain-icon"]',
    );
    const mobileSun = mobileIcon?.querySelector("svg.text-karl-gold");

    expect(mobileIcon).toBeTruthy();
    expect(mobileSun).toBeTruthy();
    expect(mobileIcon?.className).not.toContain("rounded-full");
    expect(mobileIcon?.className).not.toContain("border");
  });

  it("keeps a framed clear icon on desktop", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const { container } = render(
      <MapLocationConditionIcon location={clearLocation} />,
    );

    const desktopIcon = container.querySelector("span.hidden.lg\\:flex");

    expect(desktopIcon).toBeTruthy();
    expect(desktopIcon?.className).toContain("rounded-full");
    expect(desktopIcon?.className).toContain("border");
  });

  it("keeps fog icons inside their circular frames on mobile", () => {
    const { container } = render(
      <MapLocationConditionIcon
        location={{
          ...clearLocation,
          fogScore: 82,
          sunshineScore: 40,
          status: "Karl Territory",
        }}
      />,
    );

    expect(
      container.querySelector('[data-testid="insight-plain-icon"]'),
    ).toBeNull();
    expect(container.querySelector("span.rounded-full.border")).toBeTruthy();
  });
});
