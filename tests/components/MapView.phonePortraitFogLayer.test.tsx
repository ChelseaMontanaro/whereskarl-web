// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapView } from "@/components/map/MapView";
import * as weatherApi from "@/lib/api/weather";
import type { LocationWeather, LocationsResponse } from "@/lib/schemas/weather";

const useSearchParamsMock = vi.fn();
const usePhonePortraitMock = vi.fn(() => true);
const useMinWidthMock = vi.fn(() => false);

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/lib/hooks/useMinWidth", () => ({
  useMinWidth: () => useMinWidthMock(),
}));

vi.mock("@/lib/hooks/usePhonePortrait", () => ({
  usePhonePortrait: () => usePhonePortraitMock(),
}));

// The Fog Layer trigger under test lives in MapView's overlay, not in the map
// itself, so a lightweight BayAreaMap stub keeps the assertions focused on
// overlay placement and guarantees the map never renders a second trigger.
vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: () => <div data-testid="bay-area-map" />,
}));

const baseLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  status: "Mostly Sunny",
  temperature: 62,
  distanceText: "2 mi",
  cloudCover: 20,
  visibility: 9,
  humidity: 60,
  windSpeed: 8,
  windDirection: "W",
  weatherCode: 1,
  iconName: "sun.max.fill",
  region: "san-francisco",
  karlReason: "Test location.",
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
    predictionReason:
      "Prediction is unavailable while Karl is using fallback data.",
  },
} satisfies Omit<LocationWeather, "id" | "name" | "fogScore" | "sunshineScore">;

const sfLocation: LocationWeather = {
  ...baseLocation,
  id: "clear-spot",
  name: "Clear Spot",
  fogScore: 10,
  sunshineScore: 90,
};

function renderMap() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MapView),
    ),
  );
}

describe("MapView phone-portrait Fog Layer placement", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    usePhonePortraitMock.mockReturnValue(true);
    useMinWidthMock.mockReturnValue(false);
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue({
      locations: [sfLocation],
    } satisfies LocationsResponse);
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue({
      fogCoverage: 40,
      sunshineScore: 60,
      updatedAt: "2026-07-01T16:00:00.000Z",
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    usePhonePortraitMock.mockReturnValue(true);
    useMinWidthMock.mockReturnValue(false);
  });

  it("renders exactly one Fog Layer trigger stacked above the Fog Intensity rail", () => {
    renderMap();

    const triggers = screen.getAllByRole("button", { name: "Open map layers" });
    expect(triggers).toHaveLength(1);

    const trigger = triggers[0];
    const rail = screen.getByLabelText("Fog intensity filter");

    // The trigger and the rail share one control-group wrapper, with the
    // trigger rendered directly above the rail (earlier in document order).
    const group = rail.parentElement;
    expect(group).not.toBeNull();
    expect(group?.contains(trigger)).toBe(true);
    expect(
      trigger.compareDocumentPosition(rail) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("opens and closes the Fog Layer menu from the relocated trigger", () => {
    renderMap();

    const trigger = screen.getByRole("button", { name: "Open map layers" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(
      screen.getByRole("button", { name: "Open map layers" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("radio", { name: "Satellite" })).toBeInTheDocument();

    // While the panel is open the rail hides so the menu stays clear of it.
    expect(screen.queryByLabelText("Fog intensity filter")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close map layers" }));
    expect(
      screen.getByRole("button", { name: "Open map layers" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByLabelText("Fog intensity filter")).toBeInTheDocument();
  });

  it("keeps the Fog Layer trigger out of the top-right map region", () => {
    renderMap();

    const trigger = screen.getByRole("button", { name: "Open map layers" });
    // The relocated group is anchored to the left edge, not the top-right.
    const group = trigger.closest("div.absolute");
    expect(group?.className).toContain("left-3");
    expect(group?.className).not.toContain("right-3");
  });

  it("does not render the phone Fog Layer trigger for desktop", async () => {
    useMinWidthMock.mockReturnValue(true);
    renderMap();

    await waitFor(() => {
      expect(screen.getByTestId("bay-area-map")).toBeInTheDocument();
    });

    // Desktop renders its own controls inside BayAreaMap (stubbed here), so the
    // phone-portrait trigger must be absent.
    expect(
      screen.queryByRole("button", { name: "Open map layers" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Fog intensity filter"),
    ).not.toBeInTheDocument();
  });
});
