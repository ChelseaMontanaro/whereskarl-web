// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import { STORAGE_KEYS } from "@/lib/constants/config";
import type { LocationWeather } from "@/lib/schemas/weather";
import { DEGRADED_LOCATION_STATUS_LABEL } from "@/lib/weather/dataStatus";

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
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const { container } = render(
      <MapSelectedLocationCard location={location} onClose={vi.fn()} />,
    );

    expect(screen.getByText("Tiburon")).toBeInTheDocument();
    expect(screen.getByText("Mostly clear across Tiburon.")).toBeInTheDocument();
    expect(
      screen.getByText("Fog: 18% • Wind: W 8 mph • 68°F"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close selected location" })).toBeInTheDocument();

    const sunIcon = container.querySelector(
      '[data-testid="insight-plain-icon"] svg.text-karl-gold',
    );
    expect(sunIcon).toBeTruthy();
    expect(
      container.querySelector(
        '[data-testid="insight-plain-icon"].rounded-full',
      ),
    ).toBeNull();
    expect(container.querySelector("span.rounded-full.border")).toBeNull();
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

  it("renders the favorite heart beside the location name", () => {
    render(<MapSelectedLocationCard location={location} onClose={vi.fn()} />);

    const heading = screen.getByRole("heading", { name: "Tiburon" });
    const favoriteButton = getFavoriteButton();

    expect(heading.parentElement).toContainElement(favoriteButton);
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

  it("shows a degraded label when dataStatus.isDegraded is true", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          dataStatus: {
            source: "degraded",
            isDegraded: true,
            lastLiveObservationAt: null,
            freshnessMinutes: null,
          },
        }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(DEGRADED_LOCATION_STATUS_LABEL)).toBeInTheDocument();
  });

  it("does not show a degraded label for normal live data", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          dataStatus: {
            source: "live",
            isDegraded: false,
            lastLiveObservationAt: "2026-07-04T05:35:00+00:00",
            freshnessMinutes: 28,
          },
        }}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByText(DEGRADED_LOCATION_STATUS_LABEL),
    ).not.toBeInTheDocument();
  });

  it("uses larger mobile clear skies score typography", () => {
    render(<MapSelectedLocationCard location={location} onClose={vi.fn()} />);

    const label = screen.getByText("Clear Skies Score");
    const score = label.nextElementSibling;

    expect(label.className).toContain("max-lg:text-[0.625rem]");
    expect(score?.textContent).toBe("82");
    expect(score?.className).toContain("max-lg:text-[2rem]");
    expect(score?.className).toContain("text-[1.35rem]");
  });

  it("colors the score with the canonical Clear Skies band", () => {
    render(<MapSelectedLocationCard location={location} onClose={vi.fn()} />);

    const score = screen.getByTestId("clear-skies-score");
    // 82 → clear (green) per canonical thresholds.
    expect(score).toHaveAttribute("data-score-band", "clear");
    expect(score.getAttribute("style")).toContain("#22E36B");
  });
});

describe("MapSelectedLocationCard phone portrait", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("renders Karl's Read with the location name and score band", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    expect(screen.getByRole("heading", { name: "Tiburon" })).toBeInTheDocument();
    expect(screen.getByText("Karl's Read")).toBeInTheDocument();
    expect(
      screen.getByText("Mostly clear across Tiburon."),
    ).toBeInTheDocument();

    const score = screen.getByTestId("clear-skies-score");
    expect(score.textContent).toBe("82");
    expect(score).toHaveAttribute("data-score-band", "clear");
  });

  it("shows a canonical Air Quality slot that awaits data when AQI is absent", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const slot = screen.getByTestId("air-quality-slot");
    expect(slot).toHaveTextContent("Air Quality");
    expect(slot).toHaveTextContent("Coming Soon");
  });

  it("renders the AQI category and band when a value exists", () => {
    render(
      <MapSelectedLocationCard
        location={{ ...location, aqi: 42 }}
        phonePortrait
      />,
    );

    const slot = screen.getByTestId("air-quality-slot");
    expect(slot).toHaveTextContent("42");
    expect(slot).toHaveTextContent("Good");
    expect(slot.querySelector("[data-aqi-band='good']")).toBeTruthy();
  });

  it("renders the weather summary metrics", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const summary = screen.getByText(/Humidity 60%/);
    expect(summary).toHaveTextContent("Fog 18%");
    expect(summary).toHaveTextContent("Wind W 8 mph");
    expect(summary).toHaveTextContent("68°F");
  });

  it("shows a forecast preview when a prediction is available and no View Full Forecast button", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          prediction: {
            predictionConfidenceScore: 80,
            predictionConfidenceLabel: "High",
            predictionReason: "Sun breaks through by 11 AM.",
            trend: "clearing",
          },
        }}
        phonePortrait
      />,
    );

    expect(screen.getByText("Next hour")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /View Full Forecast/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /View Full Forecast/i }),
    ).not.toBeInTheDocument();
  });

  it("omits the forecast section when prediction data is unavailable", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    expect(screen.queryByText("Next hour")).not.toBeInTheDocument();
  });

  it("toggles favorite from the phone portrait card", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const favoriteButton = screen.getByRole("button", {
      name: "Add Tiburon to favorites",
    });
    fireEvent.click(favoriteButton);

    expect(
      screen.getByRole("button", { name: "Remove Tiburon from favorites" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
