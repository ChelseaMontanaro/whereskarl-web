// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
    expect(metrics).toHaveTextContent("Clear Sky Score");
    expect(metrics).toHaveTextContent("Fog");
    expect(metrics).toHaveTextContent("18%");
    expect(metrics).toHaveTextContent("Temp");
    expect(metrics).toHaveTextContent("68°");
    expect(metrics).toHaveTextContent("Wind");
    // Wind value shows direction + speed together (mockup); the supporting row
    // is the gold arrow + "mph".
    expect(screen.getByTestId("wind-value")).toHaveTextContent("W 8");
    expect(screen.getByTestId("wind-direction")).toHaveTextContent("mph");

    // Layer 2 — Environmental Metrics 3×2:
    // [AQI] [UV] [Pollen]
    // [Humidity] [Visibility] [KHI]
    const env = screen.getByTestId("selected-location-env-metrics");
    expect(env).toHaveTextContent("Environmental Metrics");
    expect(env).toHaveTextContent("AQI");
    expect(env).toHaveTextContent("UV");
    expect(env).toHaveTextContent("Pollen");
    expect(env).toHaveTextContent("Humidity");
    expect(env).toHaveTextContent("Visibility");
    expect(env).toHaveTextContent("KHI");
    expect(env).toContainElement(screen.getByTestId("air-quality-slot"));
    expect(env).toContainElement(screen.getByTestId("uv-index-slot"));
    expect(env).toContainElement(screen.getByTestId("pollen-slot"));
    expect(env).toContainElement(screen.getByTestId("humidity-slot"));
    expect(env).toContainElement(screen.getByTestId("visibility-slot"));
    expect(env).toContainElement(screen.getByTestId("karl-health-slot"));
    expect(screen.getByTestId("air-quality-value")).toHaveTextContent("Unavailable");
    expect(screen.getByTestId("uv-index-value")).toHaveTextContent("Unavailable");
    expect(screen.getByTestId("pollen-value")).toHaveTextContent("Unavailable");
    expect(screen.getByTestId("humidity-value")).toHaveTextContent("60%");
    expect(screen.getByTestId("visibility-value")).toHaveTextContent("8 mi");
    expect(screen.getByTestId("karl-health-value")).toHaveTextContent(
      "Coming Soon",
    );
    expect(metrics).not.toContainElement(screen.getByTestId("air-quality-slot"));
    expect(metrics).not.toContainElement(screen.getByTestId("karl-health-slot"));
    expect(env.querySelector(".grid-cols-3")).not.toBeNull();
    expect(env.querySelector(".grid-cols-4")).toBeNull();
  });

  it("renders the canonical 'CLEAR SKY SCORE' title (singular, uppercased via CSS)", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const title = screen.getByText(/Clear Sky/i);
    expect(title).toBeInTheDocument();
    // Uppercasing is presentational; the DOM text is the singular wording.
    expect(title.className).toContain("uppercase");
    expect(screen.queryByText("Clear Skies Score")).not.toBeInTheDocument();
  });

  it("keeps the Clear Sky Score title on a single line", () => {
    // Verified at 390x844 via getBoundingClientRect: the title renders on one
    // line (getClientRects().length === 1) without clipping. The multi-word
    // label uses a slightly smaller font (10px vs the 14px single-word titles)
    // so it fits its column on one line — still white, uppercase, semibold.
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const title = screen.getByText("Clear Sky Score");
    expect(title.className).toContain("whitespace-nowrap");
    expect(title.textContent).toBe("Clear Sky Score");
    expect(title.querySelector("br")).toBeNull();
  });

  it("makes the Clear Sky Score the hero metric with a larger value than the secondary metrics", () => {
    // Sizes verified at a real 390px viewport via getBoundingClientRect. The
    // score value is the hero (38px) and the secondary values are substantial
    // and easily readable (28px) but still clearly subordinate to the score.
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const score = screen.getByTestId("clear-skies-score");
    expect(score.className).toContain("text-[38px]");
    expect(score.className).toContain("font-semibold");

    // Quality label is semibold in the canonical score color.
    const quality = screen.getByTestId("clear-skies-quality");
    expect(quality.className).toContain("font-semibold");

    // Fog and Temp share one compact secondary size (length-responsive) so they
    // carry equal visual prominence, and both stay clearly subordinate to the
    // 38px hero score. For the default fixture ("18%" / "68°", both ≤3 chars)
    // that shared size is 23px.
    const metrics = screen.getByTestId("selected-location-metrics");
    const tempValue = screen.getByTestId("temp-value");
    const fogValue = screen.getByTestId("fog-value");
    expect(metrics).toContainElement(tempValue);
    expect(tempValue.className).toContain("text-[23px]");
    expect(fogValue.className).toContain("text-[23px]");
    expect(tempValue.className).not.toContain("text-[38px]");
    expect(fogValue.className).not.toContain("text-[38px]");
  });

  it("gives Temp the same compact size as Fog so Fog/Temp read with equal prominence", () => {
    // Presentation only: Temp mirrors Fog's length-responsive sizing so secondary
    // weather values stay visually equal under the Clear Sky Score hero.
    const { getByTestId } = render(
      <MapSelectedLocationCard
        location={{ ...location, temperature: 66, fogScore: 85 }}
        phonePortrait
      />,
    );
    const fogSize = getByTestId("fog-value").className.match(/text-\[\d+px\]/)?.[0];
    const tempSize = getByTestId("temp-value").className.match(/text-\[\d+px\]/)?.[0];
    expect(tempSize).toBe(fogSize);
    expect(tempSize).toBe("text-[23px]");
  });

  it("shrinks a 3-digit Temp to 19px so it fits its column like Fog's '100%'", () => {
    const { getByTestId } = render(
      <MapSelectedLocationCard
        location={{ ...location, temperature: 100 }}
        phonePortrait
      />,
    );
    expect(getByTestId("temp-value")).toHaveTextContent("100°");
    expect(getByTestId("temp-value").className).toContain("text-[19px]");
  });

  it("sizes the Fog value responsively by rendered string length so it never overflows its column", () => {
    // The Fog column is the narrowest hero column at 390px, so 2-digit
    // percentages and "100%" would overflow at the 28px secondary size. The Fog
    // value size is chosen purely from the formatted string length (typography
    // only — fogScore and canonical labels are untouched): "0%"–"99%" → 23px,
    // "100%" → 19px, and the "—" placeholder keeps the 28px secondary size.
    // Widths verified at 390×844 in Geist (col ≈50.7px): "99%"≈46.1px, "100%"≈46.2px.
    const twoDigit = render(
      <MapSelectedLocationCard
        location={{ ...location, fogScore: 85 }}
        phonePortrait
      />,
    );
    expect(twoDigit.getByTestId("fog-value")).toHaveTextContent("85%");
    expect(twoDigit.getByTestId("fog-value").className).toContain("text-[23px]");
    twoDigit.unmount();

    const full = render(
      <MapSelectedLocationCard
        location={{ ...location, fogScore: 100 }}
        phonePortrait
      />,
    );
    expect(full.getByTestId("fog-value")).toHaveTextContent("100%");
    expect(full.getByTestId("fog-value").className).toContain("text-[19px]");
    full.unmount();

    const placeholder = render(
      <MapSelectedLocationCard
        location={{ ...location, fogScore: Number.NaN, sunshineScore: Number.NaN }}
        phonePortrait
      />,
    );
    const fogPlaceholder = placeholder.getByTestId("fog-value");
    expect(fogPlaceholder).toHaveTextContent("—");
    expect(fogPlaceholder.className).toContain("text-[28px]");
  });

  it("renders all metric titles in white uppercase semibold typography", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    for (const titleText of ["Fog", "Temp", "Wind"]) {
      const title = screen.getByText(titleText);
      expect(title.className).toContain("text-white");
      expect(title.className).toContain("text-[14px]");
      expect(title.className).toContain("font-semibold");
      expect(title.className).toContain("uppercase");
    }

    // Clear Sky Score keeps the same white/uppercase/semibold treatment but a
    // slightly smaller size so its multi-word label stays on one line at 390px.
    const scoreTitle = screen.getByText("Clear Sky Score");
    expect(scoreTitle.className).toContain("text-white");
    expect(scoreTitle.className).toContain("text-[10px]");
    expect(scoreTitle.className).toContain("font-semibold");
    expect(scoreTitle.className).toContain("uppercase");
  });

  it("aligns supporting labels across the weather-strip columns", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const metrics = screen.getByTestId("selected-location-metrics");
    const columns = Array.from(metrics.children);

    for (const column of columns) {
      const supporting = column.querySelector("[data-testid='clear-skies-quality']")
        ?? column.lastElementChild;
      // Every supporting label sits a compact 4px (mt-1) below its value and
      // starts at the same y across weather columns (fixed title + value rows).
      expect(supporting?.className).toContain("mt-1");
      expect(supporting?.className).toContain("min-h-[0.9rem]");
      expect(supporting?.className).toContain("items-start");
    }

    expect(screen.getByTestId("clear-skies-quality")).toHaveTextContent("Excellent");
    expect(metrics).toHaveTextContent("Clear");
    // Wind's supporting label is the gold arrow + "mph".
    expect(screen.getByTestId("wind-direction")).toHaveTextContent("mph");
  });

  it("keeps Clear Sky Score as the first of four weather-strip columns", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const metricsRow = screen.getByTestId("selected-location-metrics");
    const columns = Array.from(metricsRow.children);
    expect(columns).toHaveLength(4);
    expect(metricsRow.className).toContain("flex");

    const score = screen.getByTestId("clear-skies-score");
    const firstColumn = columns[0];
    expect(firstColumn).toContainElement(score);
    expect(firstColumn).toContainElement(screen.getByTestId("clear-skies-quality"));
    expect(firstColumn).toHaveTextContent("Clear Sky Score");

    expect(columns[1]).toHaveTextContent("Fog");
    expect(columns[2]).toHaveTextContent("Temp");
    expect(columns[3]).toHaveTextContent("Wind");
  });

  it("does not render the score as its own oversized headline section", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    // The old design used a 2.75rem headline number above the metrics row.
    const score = screen.getByTestId("clear-skies-score");
    expect(score.className).not.toContain("text-[2.75rem]");
    // The score sits inside the shared metrics row container.
    expect(screen.getByTestId("selected-location-metrics")).toContainElement(score);
  });

  it("consumes the canonical quality label + color from the score helper", () => {
    const quality = () => screen.getByTestId("clear-skies-quality");
    const scoreEl = () => screen.getByTestId("clear-skies-score");

    // 75–100 → Excellent, green.
    const excellent = render(
      <MapSelectedLocationCard
        location={{ ...location, sunshineScore: 82 }}
        phonePortrait
      />,
    );
    expect(quality().textContent).toBe("Excellent");
    expect(scoreEl().getAttribute("style")).toContain("#22E36B");
    expect(quality().getAttribute("style")).toContain("#22E36B");
    excellent.unmount();

    // 50–74 → Good, orange.
    const good = render(
      <MapSelectedLocationCard
        location={{ ...location, sunshineScore: 60, fogScore: 45 }}
        phonePortrait
      />,
    );
    expect(quality().textContent).toBe("Good");
    expect(scoreEl().getAttribute("style")).toContain("#F5A623");
    expect(quality().getAttribute("style")).toContain("#F5A623");
    good.unmount();

    // 0–49 → Poor, red.
    render(
      <MapSelectedLocationCard
        location={{ ...location, sunshineScore: 20, fogScore: 85 }}
        phonePortrait
      />,
    );
    expect(quality().textContent).toBe("Poor");
    expect(scoreEl().getAttribute("style")).toContain("#FF5A5F");
    expect(quality().getAttribute("style")).toContain("#FF5A5F");
  });

  it("does not render the score inside an orange highlighted box", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const score = screen.getByTestId("clear-skies-score");
    // The score number carries no boxed background/border tint.
    const style = score.getAttribute("style") ?? "";
    expect(style).not.toContain("background");
    expect(style).not.toContain("box-shadow");
    expect(score.className).not.toContain("border");
  });

  it("shows the Wind direction + speed together as the value with a gold arrow + mph supporting label", () => {
    render(
      <MapSelectedLocationCard
        location={{ ...location, windDirection: "NNW", windSpeed: 12 }}
        phonePortrait
      />,
    );

    // Value row carries direction + speed together, on a single line.
    const windValue = screen.getByTestId("wind-value");
    expect(windValue).toHaveTextContent("NNW 12");
    expect(windValue.className).toContain("whitespace-nowrap");
    // Wind shares the length-responsive secondary system (≥4 chars → 19px) with
    // Fog/Temp so it never reads as a separate hierarchy.
    expect(windValue.className).toContain("text-[19px]");
    expect(windValue.className).toContain("font-light");
    expect(windValue.className).not.toContain("font-semibold");

    // Supporting row is the gold arrow + "mph".
    const windSupporting = screen.getByTestId("wind-direction");
    expect(windSupporting).toHaveTextContent("mph");
    expect(windSupporting.querySelector("svg")).not.toBeNull();
  });

  it("renders the AQI unavailable state without inventing a number or Good label", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const slot = screen.getByTestId("air-quality-slot");
    expect(slot).toHaveTextContent("AQI");
    const value = screen.getByTestId("air-quality-value");
    expect(value).toHaveTextContent("Unavailable");
    expect(value).not.toHaveTextContent("0");
    expect(value).not.toHaveTextContent("Good");
    expect(value).not.toHaveTextContent("NaN");
    // UV still occupies the second grid column as Unavailable when missing.
    expect(screen.getByTestId("uv-index-value")).toHaveTextContent("Unavailable");
  });

  it("renders canonical AQI value and category from the airQuality object", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          airQuality: {
            aqi: 42,
            category: "good",
            colorToken: "aqi.good",
            label: "Good",
            description: "Air quality is considered satisfactory.",
            pollutant: "PM2.5",
            observedAt: "2026-07-13T20:00:00.000Z",
            source: "Open-Meteo",
            isAvailable: true,
          },
        }}
        phonePortrait
      />,
    );

    const value = screen.getByTestId("air-quality-value");
    const supporting = screen.getByTestId("air-quality-supporting");
    expect(value).toHaveTextContent("42");
    expect(value).not.toHaveTextContent("Unavailable");
    expect(supporting).toHaveTextContent("Good");
    expect(value.getAttribute("data-score-band")).toBe("good");
    // Shares secondary hierarchy with Fog/Temp (≤3 chars → 23px).
    expect(value.className).toContain("text-[23px]");
  });

    it("keeps AQI, UV, Pollen, Humidity, Visibility, and KHI on one 3×2 Environmental Metrics grid", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          id: "marin-headlands",
          name: "Marin Headlands",
          fogScore: 38,
          sunshineScore: 48,
          humidity: 72,
          visibility: 10,
          airQuality: {
            aqi: 125,
            category: "unhealthy-sensitive",
            colorToken: "aqi.unhealthy-sensitive",
            label: "Unhealthy for Sensitive Groups",
            description: "Sensitive groups may experience health effects.",
            pollutant: "Ozone",
            observedAt: "2026-07-13T20:00:00.000Z",
            source: "Open-Meteo",
            isAvailable: true,
          },
          uvIndex: {
            value: 8,
            category: "very-high",
            colorToken: "uv.very-high",
            label: "Very High",
            description: "Sun protection is strongly recommended.",
            observedAt: "2026-07-13T20:00:00.000Z",
            source: "Open-Meteo",
            isAvailable: true,
          },
          pollen: {
            value: 3,
            category: "moderate",
            colorToken: "pollen.moderate",
            label: "Moderate",
            description: "People with pollen allergies may experience symptoms outdoors.",
            dominantType: "grass",
            types: {
              tree: null,
              grass: {
                value: 3,
                category: "moderate",
                colorToken: "pollen.moderate",
                label: "Moderate",
                description: null,
                inSeason: true,
              },
              weed: null,
            },
            forecastDate: "2026-07-14",
            source: "Google Pollen",
            isAvailable: true,
          },
        }}
        phonePortrait
      />,
    );

    const weather = screen.getByTestId("selected-location-metrics");
    const env = screen.getByTestId("selected-location-env-metrics");
    expect(weather).toHaveTextContent("Light Fog");
    expect(weather).not.toHaveTextContent("Unhealthy for Sensitive Groups");
    expect(weather).not.toHaveTextContent("Very High");
    expect(weather).not.toHaveTextContent("Moderate");
    expect(weather).not.toContainElement(screen.getByTestId("air-quality-slot"));
    expect(weather).not.toContainElement(screen.getByTestId("humidity-slot"));
    expect(env).toContainElement(screen.getByTestId("air-quality-slot"));
    expect(env).toContainElement(screen.getByTestId("uv-index-slot"));
    expect(env).toContainElement(screen.getByTestId("pollen-slot"));
    expect(env).toContainElement(screen.getByTestId("humidity-slot"));
    expect(env).toContainElement(screen.getByTestId("visibility-slot"));
    expect(env).toContainElement(screen.getByTestId("karl-health-slot"));
    expect(screen.getByTestId("air-quality-supporting")).toHaveTextContent(
      "Sensitive",
    );
    expect(screen.getByTestId("air-quality-supporting")).not.toHaveTextContent(
      "Unhealthy for Sensitive Groups",
    );
    expect(
      screen.getByLabelText("AQI, 125, Unhealthy for Sensitive Groups"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("air-quality-slot")).toHaveAttribute(
      "title",
      "Unhealthy for Sensitive Groups",
    );
    expect(screen.getByTestId("air-quality-supporting").className).toContain(
      "truncate",
    );
    expect(screen.getByTestId("air-quality-supporting").className).toContain(
      "min-h-[0.95rem]",
    );
    expect(screen.getByTestId("uv-index-value")).toHaveTextContent("8");
    expect(screen.getByTestId("uv-index-supporting")).toHaveTextContent("Very High");
    expect(screen.getByTestId("pollen-value")).toHaveTextContent("3");
    expect(screen.getByTestId("pollen-supporting")).toHaveTextContent("Moderate");
    expect(screen.getByTestId("humidity-value")).toHaveTextContent("72%");
    expect(screen.getByTestId("visibility-value")).toHaveTextContent("10 mi");
    expect(screen.getByTestId("karl-health-value")).toHaveTextContent(
      "Coming Soon",
    );
    // No invented qualitative labels on humidity / visibility.
    expect(env).not.toHaveTextContent("Comfortable");
    expect(env).not.toHaveTextContent("Excellent");
    expect(env.querySelector(".grid-cols-3")).not.toBeNull();
    expect(env.querySelector(".grid-cols-4")).toBeNull();
    expect(screen.queryByText("Fog & Marine")).not.toBeInTheDocument();
  });

  it("renders Marine Layer and Fog Ceiling in one shared Coming Soon card in the expanded body", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const marineCard = screen.getByTestId("selected-location-marine-card");
    expect(marineCard).toContainElement(screen.getByTestId("marine-layer-slot"));
    expect(marineCard).toContainElement(screen.getByTestId("fog-ceiling-slot"));
    expect(screen.getByTestId("marine-layer-value")).toHaveTextContent(
      "Coming Soon",
    );
    expect(screen.getByTestId("fog-ceiling-value")).toHaveTextContent(
      "Coming Soon",
    );
    // Not loose Environmental Metrics cells, and no Fog & Marine heading.
    expect(
      screen.getByTestId("selected-location-env-metrics"),
    ).not.toContainElement(marineCard);
    expect(screen.queryByTestId("selected-location-fog-marine")).not.toBeInTheDocument();
    expect(screen.queryByText("Fog & Marine")).not.toBeInTheDocument();
    expect(marineCard).not.toHaveTextContent("1,200");
    expect(marineCard).not.toHaveTextContent("900");
    expect(marineCard).not.toHaveTextContent(" ft");
    expect(screen.getByLabelText("Marine Layer height, Coming Soon")).toBeInTheDocument();
    expect(screen.getByLabelText("Fog Ceiling height, Coming Soon")).toBeInTheDocument();
    expect(screen.getByLabelText("Karl Health Index, Coming Soon")).toBeInTheDocument();

    // Implemented missing metrics stay Unavailable; placeholders stay Coming Soon.
    expect(screen.getByTestId("air-quality-value")).toHaveTextContent(
      "Unavailable",
    );
    expect(screen.getByTestId("karl-health-value")).not.toHaveTextContent(
      "Unavailable",
    );
    expect(screen.getByTestId("marine-layer-value")).not.toHaveTextContent(
      "Unavailable",
    );
  });

  it("renders humidity and visibility Unavailable when values are missing", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          humidity: Number.NaN,
          visibility: Number.NaN,
        }}
        phonePortrait
      />,
    );

    expect(screen.getByTestId("humidity-value")).toHaveTextContent(
      "Unavailable",
    );
    expect(screen.getByTestId("visibility-value")).toHaveTextContent(
      "Unavailable",
    );
    expect(screen.getByTestId("marine-layer-value")).toHaveTextContent(
      "Coming Soon",
    );
    expect(screen.getByTestId("fog-ceiling-value")).toHaveTextContent(
      "Coming Soon",
    );
  });

  it("renders canonical pollen from pollen colorToken without inventing a fake Low", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          id: "stinson-beach",
          name: "Stinson Beach",
          pollen: {
            value: 5,
            category: "very-high",
            colorToken: "pollen.very-high",
            label: "Very High",
            description: "Pollen levels are elevated.",
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
        }}
        phonePortrait
      />,
    );

    const value = screen.getByTestId("pollen-value");
    expect(value).toHaveTextContent("5");
    expect(value).toHaveAttribute("data-score-band", "very-high");
    expect(screen.getByTestId("pollen-supporting")).toHaveTextContent("Very High");
    expect(value).not.toHaveTextContent("Low");
  });

  it("renders canonical UV from uvIndex colorToken without inventing a fake Low", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          id: "stinson-beach",
          name: "Stinson Beach",
          uvIndex: {
            value: 11,
            category: "extreme",
            colorToken: "uv.extreme",
            label: "Extreme",
            description: "Take all precautions.",
            observedAt: "2026-07-13T20:00:00.000Z",
            source: "Open-Meteo",
            isAvailable: true,
          },
        }}
        phonePortrait
      />,
    );

    const value = screen.getByTestId("uv-index-value");
    expect(value).toHaveTextContent("11");
    expect(value).toHaveAttribute("data-score-band", "extreme");
    expect(screen.getByTestId("uv-index-supporting")).toHaveTextContent("Extreme");
    expect(value).not.toHaveTextContent("Low");
  });

  it("renders desktop compact AQI from the same canonical field", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          airQuality: {
            aqi: 110,
            category: "unhealthy-sensitive",
            colorToken: "aqi.unhealthy-sensitive",
            label: "Unhealthy for Sensitive Groups",
            description: null,
            pollutant: null,
            observedAt: "2026-07-13T20:00:00.000Z",
            source: "Open-Meteo",
            isAvailable: true,
          },
        }}
      />,
    );

    const desktopAqi = screen.getByTestId("desktop-air-quality");
    expect(desktopAqi).toHaveTextContent("AQI 110 · Unhealthy for Sensitive Groups");
    expect(desktopAqi.getAttribute("data-aqi-category")).toBe("unhealthy-sensitive");
    expect(desktopAqi.className).toContain("line-clamp-2");
    expect(screen.queryByTestId("desktop-uv-index")).not.toBeInTheDocument();
    expect(screen.queryByTestId("desktop-pollen")).not.toBeInTheDocument();
    // Phone Fog & Marine / Environmental Metrics grid remain phone-only.
    expect(screen.queryByTestId("selected-location-env-metrics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("selected-location-marine-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("karl-health-slot")).not.toBeInTheDocument();
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
    const logo = container.querySelector('img[src*="wheres-karl-logo"]');
    expect(logo).toBeTruthy();
    expect(logo?.className).toContain("h-14");
    expect(logo?.className).toContain("w-14");
  });

  it("reads Karl's Read as the insight paragraph, not the terse condition label", () => {
    render(
      <MapSelectedLocationCard
        location={{
          ...location,
          status: "Foggy",
          fogScore: 80,
          sunshineScore: 20,
          karlReason:
            "A marine layer is holding along the shoreline but should thin by early afternoon.",
        }}
        phonePortrait
      />,
    );

    const karlSection = screen.getByRole("region", { name: "Karl's Read" });
    expect(karlSection).toHaveTextContent(
      "A marine layer is holding along the shoreline but should thin by early afternoon.",
    );
    // The bare status label must not stand in for the insight paragraph.
    expect(karlSection).not.toHaveTextContent("Foggy");
  });

  it("uses the canonical clear condition icon (cloud-free sun) in the hourly outlook", () => {
    const { container } = render(
      <MapSelectedLocationCard location={location} phonePortrait />,
    );

    const forecast = screen.getByRole("region", { name: "Hourly outlook" });
    const icon = forecast.querySelector("img");
    expect(icon).not.toBeNull();

    const decoded = decodeURIComponent(icon?.getAttribute("src") ?? "");
    // Canonical clear icon is the warm sun with no cloud rectangles.
    expect(decoded).toContain("#F2A326");
    expect(decoded).not.toContain("<rect");
  });

  it("renders an hourly outlook strip without a View Full Forecast action", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const forecast = screen.getByRole("region", { name: "Hourly outlook" });
    expect(forecast).toHaveTextContent("Hourly Outlook");
    // "Now" period is always present, populated with the real current temperature.
    expect(forecast).toHaveTextContent("Now");
    expect(forecast).toHaveTextContent("68°");
    expect(
      screen.queryByRole("button", { name: /View Full Forecast/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /View Full Forecast/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the Hourly Outlook title in white, not gold", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    const title = screen.getByText("Hourly Outlook");
    expect(title.className).toContain("text-white");
    expect(title.className).not.toContain("text-karl-gold");
  });

  it("renders hourly periods as a lightweight strip with no tile background or border", () => {
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

    const periods = screen.getAllByTestId("hourly-outlook-period");
    expect(periods.length).toBeGreaterThan(0);

    for (const period of periods) {
      // No filled tile, no border, no heavy rounded box around each period.
      expect(period.className).not.toMatch(/\bbg-/);
      expect(period.className).not.toMatch(/\bborder\b/);
      expect(period.className).not.toMatch(/\bborder-/);
      expect(period.className).not.toMatch(/\brounded/);
      // Each period keeps its time, canonical icon, and temperature.
      expect(period.querySelector("img")).not.toBeNull();
    }
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

  it("expands the collapsed sheet when the header identity area is tapped", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toHaveAttribute("aria-expanded", "false");

    // Tapping the (non-interactive) location name expands the sheet.
    fireEvent.click(screen.getByRole("heading", { name: "Tiburon" }));

    expect(
      screen.getByRole("button", { name: "Collapse details" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("expands the collapsed sheet when the metrics row is tapped", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    fireEvent.click(screen.getByTestId("selected-location-metrics"));

    expect(
      screen.getByRole("button", { name: "Collapse details" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("does not expand the sheet when the favorite control is tapped", () => {
    render(<MapSelectedLocationCard location={location} phonePortrait />);

    fireEvent.click(
      screen.getByRole("button", { name: "Add Tiburon to favorites" }),
    );

    // Favorite toggled, but the sheet stayed collapsed.
    expect(
      screen.getByRole("button", { name: "Remove Tiburon from favorites" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("dismisses (does not expand) when the close button is tapped", () => {
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
    // The close tap dismissed rather than expanding the sheet.
    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});
