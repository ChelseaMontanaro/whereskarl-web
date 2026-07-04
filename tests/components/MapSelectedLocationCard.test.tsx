// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import { STORAGE_KEYS } from "@/lib/constants/config";
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

function getFavoriteButton(name = "Tiburon") {
  return screen.getByRole("button", { name: `Add ${name} to favorites` });
}

describe("MapSelectedLocationCard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("renders the selected location details in a polished info card", () => {
    render(<MapSelectedLocationCard location={location} onClose={vi.fn()} />);

    expect(screen.getByText("Tiburon")).toBeInTheDocument();
    expect(screen.getByText("Mostly clear across Tiburon.")).toBeInTheDocument();
    expect(
      screen.getByText("Fog: 18% • Wind: W 8 mph • 68°F"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close selected location" })).toBeInTheDocument();
  });

  it("renders metrics with explicit Fog, Wind, and Fahrenheit labels", () => {
    render(<MapSelectedLocationCard location={location} onClose={vi.fn()} />);

    const metrics = screen.getByText("Fog: 18% • Wind: W 8 mph • 68°F");

    expect(metrics).toHaveTextContent("Fog:");
    expect(metrics).toHaveTextContent("Wind:");
    expect(metrics).toHaveTextContent("°F");
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

  it("toggles favorite state when the heart control is clicked", () => {
    render(<MapSelectedLocationCard location={location} onClose={vi.fn()} />);

    const favoriteButton = getFavoriteButton();

    expect(favoriteButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(favoriteButton);

    expect(
      screen.getByRole("button", { name: "Remove Tiburon from favorites" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      JSON.parse(
        window.localStorage.getItem(STORAGE_KEYS.favoriteLocationIDs) ?? "[]",
      ),
    ).toContain("tiburon");

    fireEvent.click(
      screen.getByRole("button", { name: "Remove Tiburon from favorites" }),
    );

    expect(getFavoriteButton()).toHaveAttribute("aria-pressed", "false");
    expect(
      JSON.parse(
        window.localStorage.getItem(STORAGE_KEYS.favoriteLocationIDs) ?? "[]",
      ),
    ).not.toContain("tiburon");
  });

  it("shows saved favorite state when the location is already favorited", () => {
    window.localStorage.setItem(
      STORAGE_KEYS.favoriteLocationIDs,
      JSON.stringify(["tiburon"]),
    );

    render(<MapSelectedLocationCard location={location} onClose={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Remove Tiburon from favorites" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
