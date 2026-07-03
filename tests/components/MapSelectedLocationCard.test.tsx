// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import type { LocationWeather } from "@/lib/schemas/weather";

const location: LocationWeather = {
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

describe("MapSelectedLocationCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the selected location details in a polished info card", () => {
    render(<MapSelectedLocationCard location={location} onClose={vi.fn()} />);

    expect(screen.getByText("Tiburon")).toBeInTheDocument();
    expect(screen.getByText("Mostly Sunny")).toBeInTheDocument();
    expect(screen.getByText("Clear Skies Score")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("18% fog")).toBeInTheDocument();
    expect(screen.getByText("8 mph W")).toBeInTheDocument();
    expect(screen.getByText("68°")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close selected location" })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();

    render(<MapSelectedLocationCard location={location} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close selected location" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();

    render(<MapSelectedLocationCard location={location} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
