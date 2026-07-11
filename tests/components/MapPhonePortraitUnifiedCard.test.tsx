// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapPhonePortraitUnifiedCard } from "@/components/map/MapPhonePortraitUnifiedCard";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";
import type { LocationWeather } from "@/lib/schemas/weather";

const previewLocation: LocationWeather = {
  id: "tiburon",
  name: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  status: "Mostly Sunny",
  temperature: 68,
  sunshineScore: 82,
  distanceText: "8 mi",
  cloudCover: 30,
  visibility: 8,
  humidity: 60,
  windSpeed: 8,
  windDirection: "W",
  weatherCode: 2,
  iconName: "cloud.sun.fill",
  fogScore: 18,
  karlReason: "Mostly clear across Tiburon.",
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

describe("MapPhonePortraitUnifiedCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows one compact Best Right Now summary and cycles ranked locations", () => {
    const onSelectLocation = vi.fn();
    const onClearSelection = vi.fn();
    const items: BestRightNowItem[] = [
      {
        locationId: "san-jose",
        locationName: "San Jose",
        detail: "Mostly clear",
        score: 90,
        scoreLabel: "90 clear",
        rank: 1,
      },
      {
        locationId: "oakland",
        locationName: "Oakland",
        detail: "Patchy fog",
        score: 72,
        scoreLabel: "72 clear",
        rank: 2,
      },
      {
        locationId: "mountain-view",
        locationName: "Mountain View",
        detail: "Clear skies",
        score: 85,
        scoreLabel: "85 clear",
        rank: 3,
      },
    ];

    render(
      <MapPhonePortraitUnifiedCard
        items={items}
        selectedLocation={null}
        onSelectLocation={onSelectLocation}
        onClearSelection={onClearSelection}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Select San Jose on map" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select Oakland on map" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Show next Best Right Now location" }),
    );

    expect(
      screen.getByRole("button", { name: "Select Oakland on map" }),
    ).toBeInTheDocument();
    expect(onSelectLocation).not.toHaveBeenCalled();
    expect(onClearSelection).not.toHaveBeenCalled();
  });

  it("selects the visible location and shows preview inside the same card", () => {
    const onSelectLocation = vi.fn();
    const onClearSelection = vi.fn();
    const items: BestRightNowItem[] = [
      {
        locationId: "san-jose",
        locationName: "San Jose",
        detail: "Mostly clear",
        score: 90,
        rank: 1,
      },
    ];

    const { rerender } = render(
      <MapPhonePortraitUnifiedCard
        items={items}
        selectedLocation={null}
        onSelectLocation={onSelectLocation}
        onClearSelection={onClearSelection}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Select San Jose on map" }),
    );

    expect(onSelectLocation).toHaveBeenCalledWith("san-jose");

    rerender(
      <MapPhonePortraitUnifiedCard
        items={items}
        selectedLocation={{ ...previewLocation, id: "san-jose", name: "San Jose" }}
        onSelectLocation={onSelectLocation}
        onClearSelection={onClearSelection}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "San Jose" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select San Jose on map" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Fog: 18% • Wind: W 8 mph • 68°F"),
    ).toBeInTheDocument();
  });

  it("returns to summary when cycling from preview without selecting", () => {
    const onSelectLocation = vi.fn();
    const onClearSelection = vi.fn();
    const items: BestRightNowItem[] = [
      {
        locationId: "san-jose",
        locationName: "San Jose",
        detail: "Mostly clear",
        score: 90,
        rank: 1,
      },
      {
        locationId: "oakland",
        locationName: "Oakland",
        detail: "Patchy fog",
        score: 72,
        rank: 2,
      },
    ];

    const { rerender } = render(
      <MapPhonePortraitUnifiedCard
        items={items}
        selectedLocation={previewLocation}
        onSelectLocation={onSelectLocation}
        onClearSelection={onClearSelection}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Show next Best Right Now location" }),
    );

    expect(onClearSelection).toHaveBeenCalledTimes(1);
    expect(onSelectLocation).not.toHaveBeenCalled();

    rerender(
      <MapPhonePortraitUnifiedCard
        items={items}
        selectedLocation={null}
        onSelectLocation={onSelectLocation}
        onClearSelection={onClearSelection}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Select Oakland on map" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Tiburon" }),
    ).not.toBeInTheDocument();
  });
});
