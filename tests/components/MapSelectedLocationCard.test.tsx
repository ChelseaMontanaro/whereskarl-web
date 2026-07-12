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

describe("MapSelectedLocationCard phone portrait bottom sheet", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("renders the selection inside a labelled bottom sheet with a grab handle", () => {
    render(
      <MapSelectedLocationCard
        location={location}
        phonePortrait
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Selected location: Tiburon" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tiburon" })).toBeInTheDocument();
    // Subtitle reads as "<area>, CA".
    expect(screen.getByText(/,\s*CA$/)).toBeInTheDocument();
  });

  it("renders the canonical metrics row from the presentation helpers", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const score = screen.getByTestId("clear-skies-score");
    expect(score.textContent).toBe("82");
    expect(score).toHaveAttribute("data-score-band", "clear");

    const metrics = screen.getByTestId("selected-location-metrics");
    expect(metrics).toHaveTextContent("Clear Skies");
    expect(metrics).toHaveTextContent("Fog");
    expect(metrics).toHaveTextContent("18%");
    expect(metrics).toHaveTextContent("AQI");
    expect(metrics).toHaveTextContent("Temp");
    expect(metrics).toHaveTextContent("68°");
    expect(metrics).toHaveTextContent("Wind");
    expect(metrics).toHaveTextContent("W 8");
    expect(metrics).toHaveTextContent("mph");
  });

  it("shows the canonical Air Quality slot as 'Coming Soon' when AQI is absent", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const slot = screen.getByTestId("air-quality-slot");
    expect(slot).toHaveTextContent("AQI");
    expect(slot).toHaveTextContent("Coming Soon");
  });

  it("renders the AQI category when a value exists", () => {
    render(
      <MapSelectedLocationCard location={{ ...location, aqi: 42 }} phonePortrait />,
    );

    const slot = screen.getByTestId("air-quality-slot");
    expect(slot).toHaveTextContent("42");
    expect(slot).toHaveTextContent("Good");
    expect(slot).not.toHaveTextContent("Coming Soon");
  });

  it("renders a neutral premium location-image placeholder with no per-location image pipeline", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const placeholder = screen.getByTestId("location-image-placeholder");
    expect(placeholder).toHaveTextContent("Location Image");
    expect(placeholder).toHaveTextContent("Coming Soon");
    // Presentation-only: the placeholder is not a real <img> and pulls in no
    // per-location image source, mapping, or second image system.
    expect(placeholder.querySelector("img")).toBeNull();
    expect(placeholder.className).toContain("rounded-full");
  });

  it("renders Karl's Read as the primary insight with the smiling fog logo", () => {
    const { container } = render(
      <MapSelectedLocationCard location={location} phonePortrait />,
    );

    const karlSection = screen.getByRole("region", { name: "Karl's Read" });
    expect(karlSection).toHaveTextContent("Karl's Read");
    expect(karlSection).toHaveTextContent("Mostly clear across Tiburon.");
    // The Karl logo image (brand asset) is rendered, not a generic icon.
    expect(container.querySelector('img[src*="wheres-karl-logo"]')).toBeTruthy();
  });

  it("renders an hourly outlook chip strip without a View Full Forecast action", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const forecast = screen.getByRole("region", { name: "Hourly outlook" });
    expect(forecast).toHaveTextContent("Hourly Outlook");
    // "Now" chip is always present, populated with the real current temperature.
    expect(forecast).toHaveTextContent("Now");
    expect(forecast).toHaveTextContent("68°");
    expect(
      screen.queryByRole("button", { name: /View Full Forecast/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /View Full Forecast/i }),
    ).not.toBeInTheDocument();
  });

  it("adds a next-hour chip when a projected fog score exists (no fabricated temps)", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          prediction: {
            ...location.prediction,
            trend: "clearing",
            projectedFogScore1h: 40,
          },
        }}
        phonePortrait
      />,
    );

    const forecast = screen.getByRole("region", { name: "Hourly outlook" });
    expect(forecast).toHaveTextContent("Next hr");
    expect(forecast).toHaveTextContent("Light Fog");
  });

  it("closes via the header close button", () => {
    const onClose = vi.fn();
    render(
      <MapSelectedLocationCard
        location={location}
        phonePortrait
        onClose={onClose}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <MapSelectedLocationCard
        location={location}
        phonePortrait
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("toggles favorite from the sheet header", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    fireEvent.click(
      screen.getByRole("button", { name: "Add Tiburon to favorites" }),
    );

    expect(
      screen.getByRole("button", { name: "Remove Tiburon from favorites" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
