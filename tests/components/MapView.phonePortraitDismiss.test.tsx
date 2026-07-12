// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
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
import type { BayAreaBackendRegionId } from "@/lib/map/config";
import type { LocationWeather } from "@/lib/schemas/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

const useSearchParamsMock = vi.fn();
const replaceMock = vi.fn();
const useMinWidthMock = vi.fn(() => false);
const usePhonePortraitMock = vi.fn(() => true);

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/lib/hooks/useMinWidth", () => ({
  useMinWidth: () => useMinWidthMock(),
}));

vi.mock("@/lib/hooks/usePhonePortrait", () => ({
  usePhonePortrait: () => usePhonePortraitMock(),
}));

// Marker taps flow through BayAreaMap's onSelectLocation. The mock exposes a
// tappable marker so we can exercise the real selection pipeline.
vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: ({
    onSelectLocation,
  }: {
    onSelectLocation: (id: string) => void;
  }) => (
    <div data-testid="bay-area-map">
      <button type="button" onClick={() => onSelectLocation("tiburon")}>
        mock-marker-tiburon
      </button>
    </div>
  ),
}));

const tiburonTemplate = JSON.parse(
  readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"),
).locations[0] as LocationWeather;

function createRegionLocation(
  id: string,
  name: string,
  region: BayAreaBackendRegionId,
  sunshineScore: number,
): LocationWeather {
  return {
    ...tiburonTemplate,
    id,
    name,
    region,
    sunshineScore,
    fogScore: Math.max(10, 100 - sunshineScore),
  };
}

const locations = {
  locations: [
    createRegionLocation("ocean-beach", "Ocean Beach", "san-francisco", 85),
    createRegionLocation("tiburon", "Tiburon", "north-bay", 82),
    createRegionLocation("palo-alto", "Palo Alto", "south-bay", 88),
    createRegionLocation("san-jose", "San Jose", "south-bay", 91),
  ],
};

function renderMap() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const view = render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MapView),
    ),
  );

  return {
    ...view,
    rerenderMap: () =>
      view.rerender(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(MapView),
        ),
      ),
  };
}

function locationReplaceHrefs(): string[] {
  return replaceMock.mock.calls
    .map(([href]) => String(href))
    .filter((href) => href.startsWith("/map?location="));
}

describe("MapView phone-portrait sheet dismissal (canonical URL selection)", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    usePhonePortraitMock.mockReturnValue(true);
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue(locations);
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "current.json"), "utf8")),
    );
    vi.spyOn(weatherApi, "getBestSunshine").mockResolvedValue({
      locationID: "palo-alto",
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    useMinWidthMock.mockReturnValue(false);
    usePhonePortraitMock.mockReturnValue(true);
  });

  it("auto-selects the canonical Best Right Now location exactly once on a clean entry", async () => {
    renderMap();

    await waitFor(() => {
      expect(locationReplaceHrefs()).toEqual(["/map?location=palo-alto"]);
    });
  });

  it("closing clears ?location= and keeps the sheet dismissed", async () => {
    const { rerenderMap } = renderMap();

    await waitFor(() =>
      expect(locationReplaceHrefs()).toContain("/map?location=palo-alto"),
    );

    // Simulate the URL settling on the auto-selected location.
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=palo-alto"));
    rerenderMap();
    expect(
      await screen.findByLabelText("Selected location: Palo Alto"),
    ).toBeInTheDocument();

    // Explicit dismissal clears the canonical selection param.
    replaceMock.mockClear();
    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );
    expect(replaceMock).toHaveBeenCalledWith("/map", { scroll: false });

    // URL clears; the dismissed sheet must NOT reappear.
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerenderMap();

    await waitFor(() =>
      expect(screen.queryByLabelText(/Selected location:/)).not.toBeInTheDocument(),
    );
  });

  it("does not re-auto-select Best Right Now after an explicit close", async () => {
    const { rerenderMap } = renderMap();

    await waitFor(() =>
      expect(locationReplaceHrefs()).toContain("/map?location=palo-alto"),
    );

    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=palo-alto"));
    rerenderMap();
    await screen.findByLabelText("Selected location: Palo Alto");

    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );

    // From here, no auto-selection replace should ever fire again.
    replaceMock.mockClear();
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerenderMap();

    await waitFor(() =>
      expect(screen.queryByLabelText(/Selected location:/)).not.toBeInTheDocument(),
    );
    expect(locationReplaceHrefs()).toEqual([]);
  });

  it("reopens the sheet when a marker is tapped after closing", async () => {
    const { rerenderMap } = renderMap();

    await waitFor(() =>
      expect(locationReplaceHrefs()).toContain("/map?location=palo-alto"),
    );

    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=palo-alto"));
    rerenderMap();
    await screen.findByLabelText("Selected location: Palo Alto");

    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerenderMap();
    expect(
      screen.queryByLabelText(/Selected location:/),
    ).not.toBeInTheDocument();

    // A real marker tap routes through the canonical selection pipeline.
    replaceMock.mockClear();
    fireEvent.click(
      screen.getByRole("button", { name: "mock-marker-tiburon" }),
    );
    expect(replaceMock).toHaveBeenCalledWith("/map?location=tiburon", {
      scroll: false,
    });

    // The URL reflects the tapped marker → the sheet reopens for it.
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));
    rerenderMap();
    expect(
      await screen.findByLabelText("Selected location: Tiburon"),
    ).toBeInTheDocument();
  });

  it("opens the sheet directly from a ?location= deep link without auto-selecting", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));

    renderMap();

    expect(
      await screen.findByLabelText("Selected location: Tiburon"),
    ).toBeInTheDocument();
    // The deep-linked location is canonical; no Best Right Now auto-selection.
    expect(locationReplaceHrefs()).toEqual([]);
  });

  it("does not reopen the dismissed sheet when only the region changes", async () => {
    const { rerenderMap } = renderMap();

    await waitFor(() =>
      expect(locationReplaceHrefs()).toContain("/map?location=palo-alto"),
    );

    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=palo-alto"));
    rerenderMap();
    await screen.findByLabelText("Selected location: Palo Alto");

    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerenderMap();
    expect(
      screen.queryByLabelText(/Selected location:/),
    ).not.toBeInTheDocument();

    // A region change (chip) sets ?region= only — it must not reopen the sheet.
    replaceMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "North Bay" }));
    expect(replaceMock).toHaveBeenCalledWith("/map?region=north-bay", {
      scroll: false,
    });

    useSearchParamsMock.mockReturnValue(new URLSearchParams("region=north-bay"));
    rerenderMap();

    await waitFor(() =>
      expect(screen.queryByLabelText(/Selected location:/)).not.toBeInTheDocument(),
    );
    expect(locationReplaceHrefs()).toEqual([]);
  });
});
