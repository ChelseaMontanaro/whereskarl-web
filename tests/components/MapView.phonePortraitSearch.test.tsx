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
  within,
} from "@testing-library/react";
import {
  createElement,
  forwardRef,
  useImperativeHandle,
} from "react";
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

const focusLocationMock = vi.fn();
const fitAllBayViewMock = vi.fn();
const resetViewMock = vi.fn();

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

vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: forwardRef(function MockBayAreaMap(
    {
      locations,
      onSelectLocation,
    }: {
      locations: { id: string; name: string; longitude: number; latitude: number }[];
      onSelectLocation: (id: string) => void;
    },
    ref,
  ) {
    useImperativeHandle(ref, () => ({
      resetView: resetViewMock,
      locateMe: vi.fn(),
      focusLocation: focusLocationMock,
      fitAllBayView: fitAllBayViewMock,
    }));

    return createElement(
      "div",
      {
        "data-testid": "bay-area-map",
        "data-location-ids": locations.map((item) => item.id).join(","),
      },
      createElement(
        "button",
        { type: "button", onClick: () => onSelectLocation("tiburon") },
        "mock-marker-tiburon",
      ),
    );
  }),
}));

const tiburonTemplate = JSON.parse(
  readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"),
).locations[0] as LocationWeather;

function createLocation(
  id: string,
  name: string,
  region: BayAreaBackendRegionId,
  sunshineScore: number,
  coords?: { latitude: number; longitude: number },
): LocationWeather {
  return {
    ...tiburonTemplate,
    id,
    name,
    region,
    sunshineScore,
    fogScore: Math.max(10, 100 - sunshineScore),
    latitude: coords?.latitude ?? tiburonTemplate.latitude,
    longitude: coords?.longitude ?? tiburonTemplate.longitude,
  };
}

const catalogLocations = {
  locations: [
    createLocation("san-francisco", "San Francisco", "san-francisco", 70, {
      latitude: 37.7749,
      longitude: -122.4194,
    }),
    createLocation("san-rafael", "San Rafael", "north-bay", 72),
    createLocation("san-ramon", "San Ramon", "east-bay", 80),
    createLocation("santa-rosa", "Santa Rosa", "north-bay", 75, {
      latitude: 38.4404,
      longitude: -122.7141,
    }),
    createLocation("sausalito", "Sausalito", "north-bay", 68),
    createLocation("half-moon-bay", "Half Moon Bay", "peninsula", 77),
    createLocation("tiburon", "Tiburon", "north-bay", 82),
    createLocation("cupertino", "Cupertino", "south-bay", 84),
    createLocation("stinson-beach", "Stinson Beach", "north-bay", 60),
    createLocation("palo-alto", "Palo Alto", "south-bay", 88),
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

describe("MapView phone-portrait canonical location search (16.3C.1b)", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    usePhonePortraitMock.mockReturnValue(true);
    useMinWidthMock.mockReturnValue(false);
    focusLocationMock.mockClear();
    fitAllBayViewMock.mockClear();
    resetViewMock.mockClear();
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue(catalogLocations);
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

  it("searches the same canonical catalog already loaded for map markers without a second fetch", async () => {
    renderMap();

    const searchInput = await screen.findByRole("combobox", {
      name: "Search locations",
    });
    const map = await screen.findByTestId("bay-area-map");

    await waitFor(() => {
      expect(map.getAttribute("data-location-ids")).toContain("santa-rosa");
    });

    expect(weatherApi.getLocations).toHaveBeenCalledTimes(1);

    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "sa" } });

    const results = await screen.findByTestId("map-phone-portrait-search-results");
    const names = within(results)
      .getAllByRole("option")
      .map((option) => option.textContent);

    expect(names).toEqual([
      "San Francisco",
      "San Rafael",
      "San Ramon",
      "Santa Rosa",
      "Sausalito",
    ]);

    expect(weatherApi.getLocations).toHaveBeenCalledTimes(1);

    const mapIds = new Set(
      (map.getAttribute("data-location-ids") ?? "").split(",").filter(Boolean),
    );
    for (const name of names) {
      const match = catalogLocations.locations.find((item) => item.name === name);
      expect(match).toBeDefined();
      expect(mapIds.has(match!.id)).toBe(true);
    }
  });

  it("keeps the full canonical catalog searchable under an active region and fog filter", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("region=south-bay"));
    const { rerenderMap } = renderMap();

    await screen.findByTestId("bay-area-map");
    // Activate Foggy intensity so markers are heavily filtered.
    fireEvent.click(screen.getByRole("button", { name: "Foggy" }));
    rerenderMap();

    const searchInput = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Santa" } });

    expect(
      await screen.findByRole("option", { name: "Santa Rosa" }),
    ).toBeInTheDocument();
  });

  it("shows the no-results state for unmatched queries", async () => {
    renderMap();

    const searchInput = await screen.findByRole("combobox", {
      name: "Search locations",
    });
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "xyzzy" } });

    const results = await screen.findByTestId("map-phone-portrait-search-results");
    expect(within(results).getByText("No matching locations")).toBeInTheDocument();
    expect(within(results).queryByRole("option")).toBeNull();
  });

  it("selects a result via canonical selection and the reusable location camera path", async () => {
    const { rerenderMap } = renderMap();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/map?location=palo-alto", {
        scroll: false,
      });
    });
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=palo-alto"));
    rerenderMap();
    await screen.findByLabelText("Selected location: Palo Alto");

    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerenderMap();
    await waitFor(() =>
      expect(screen.queryByLabelText(/Selected location:/)).not.toBeInTheDocument(),
    );

    const searchInput = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Santa" } });

    replaceMock.mockClear();
    focusLocationMock.mockClear();
    fireEvent.click(await screen.findByRole("option", { name: "Santa Rosa" }));

    expect(replaceMock).toHaveBeenCalledWith("/map?location=santa-rosa", {
      scroll: false,
    });
    expect(focusLocationMock).toHaveBeenCalledWith(-122.7141, 38.4404);
    expect(focusLocationMock).toHaveBeenCalledTimes(1);
    expect(searchInput).toHaveValue("Santa Rosa");
    expect(
      screen.queryByTestId("map-phone-portrait-search-results"),
    ).not.toBeInTheDocument();

    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("location=santa-rosa"),
    );
    rerenderMap();
    expect(
      await screen.findByLabelText("Selected location: Santa Rosa"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("search and marker selection share the same collapsed canonical sheet presentation", async () => {
    const { rerenderMap } = renderMap();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/map?location=palo-alto", {
        scroll: false,
      });
    });
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("location=palo-alto"),
    );
    rerenderMap();
    await screen.findByLabelText("Selected location: Palo Alto");

    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerenderMap();
    await waitFor(() =>
      expect(screen.queryByLabelText(/Selected location:/)).not.toBeInTheDocument(),
    );

    const searchInput = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Tiburon" } });
    fireEvent.click(await screen.findByRole("option", { name: "Tiburon" }));

    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));
    rerenderMap();
    const searchSheet = await screen.findByLabelText("Selected location: Tiburon");
    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(searchSheet.className).toContain(
      "bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
    );
    const searchSheetClassName = searchSheet.className;

    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerenderMap();
    await waitFor(() =>
      expect(screen.queryByLabelText(/Selected location:/)).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "mock-marker-tiburon" }));
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));
    rerenderMap();
    const markerSheet = await screen.findByLabelText("Selected location: Tiburon");
    expect(
      screen.getByRole("button", { name: "Expand details" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(markerSheet.className).toBe(searchSheetClassName);
  });

  it("clearing search clears selection and explicitly restores the All Bay camera", async () => {
    const { rerenderMap } = renderMap();

    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("location=tiburon"),
    );
    rerenderMap();
    await screen.findByLabelText("Selected location: Tiburon");

    const searchInput = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Tiburon" } });
    expect(
      screen.getByRole("button", { name: "Clear search" }),
    ).toBeInTheDocument();

    replaceMock.mockClear();
    fitAllBayViewMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(replaceMock).toHaveBeenCalledWith("/map", { scroll: false });
    expect(fitAllBayViewMock).toHaveBeenCalledTimes(1);
    expect(searchInput).toHaveValue("");
    expect(
      screen.queryByTestId("map-phone-portrait-search-results"),
    ).not.toBeInTheDocument();

    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerenderMap();
    await waitFor(() =>
      expect(screen.queryByLabelText(/Selected location:/)).not.toBeInTheDocument(),
    );
  });

  it("ordinary sheet dismissal does not invoke the search All Bay camera path", async () => {
    const { rerenderMap } = renderMap();

    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("location=tiburon"),
    );
    rerenderMap();
    await screen.findByLabelText("Selected location: Tiburon");

    replaceMock.mockClear();
    fitAllBayViewMock.mockClear();
    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );

    expect(replaceMock).toHaveBeenCalledWith("/map", { scroll: false });
    expect(fitAllBayViewMock).not.toHaveBeenCalled();
  });

  it("marker taps do not invoke the search location camera path", async () => {
    const { rerenderMap } = renderMap();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/map?location=palo-alto", {
        scroll: false,
      });
    });
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=palo-alto"));
    rerenderMap();
    await screen.findByLabelText("Selected location: Palo Alto");

    fireEvent.click(
      screen.getByRole("button", { name: "Close selected location" }),
    );
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    rerenderMap();
    await waitFor(() =>
      expect(screen.queryByLabelText(/Selected location:/)).not.toBeInTheDocument(),
    );

    replaceMock.mockClear();
    focusLocationMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "mock-marker-tiburon" }));

    expect(replaceMock).toHaveBeenCalledWith("/map?location=tiburon", {
      scroll: false,
    });
    expect(focusLocationMock).not.toHaveBeenCalled();
  });

  it("dismissing the overlay outside does not clear the selected location", async () => {
    const { rerenderMap } = renderMap();

    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("location=tiburon"),
    );
    rerenderMap();
    await screen.findByLabelText("Selected location: Tiburon");

    const searchInput = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.change(searchInput, { target: { value: "tib" } });
    fireEvent.focus(searchInput);
    expect(
      screen.getByTestId("map-phone-portrait-search-results"),
    ).toBeInTheDocument();

    replaceMock.mockClear();
    await waitFor(() => {
      fireEvent.pointerDown(screen.getByTestId("bay-area-map"));
      expect(
        screen.queryByTestId("map-phone-portrait-search-results"),
      ).not.toBeInTheDocument();
    });

    expect(replaceMock).not.toHaveBeenCalled();
    expect(
      screen.getByLabelText("Selected location: Tiburon"),
    ).toBeInTheDocument();
    expect(searchInput).toHaveValue("tib");
  });

  it("preserves search bar, region chips, Fog Intensity rail, and Layers layout anchors", async () => {
    renderMap();

    const searchBar = await screen.findByTestId("map-phone-portrait-search-bar");
    expect(searchBar.className).toContain("rounded-full");
    expect(searchBar.className).not.toContain("pointer-events-none");
    expect(searchBar.parentElement?.className).toContain("mx-1");
    expect(screen.getByRole("button", { name: "SF" })).toBeInTheDocument();

    const headerContainer =
      searchBar.parentElement?.parentElement?.parentElement;
    expect(headerContainer?.className).toContain(
      "top-[calc(1.375rem+env(safe-area-inset-top))]",
    );
    expect(headerContainer?.className).toContain("inset-x-3");

    const rail = screen.getByLabelText("Fog intensity filter");
    const layers = screen.getByRole("button", { name: "Open map layers" });
    const railGroup = rail.closest("div.absolute");
    const layersGroup = layers.closest("div.absolute");

    expect(railGroup?.className).toContain(
      "top-[calc(7.125rem+env(safe-area-inset-top))]",
    );
    expect(layersGroup?.className).toContain(
      "top-[calc(7.125rem+env(safe-area-inset-top))]",
    );
  });

  it("uses prefix-only matching so Ti returns Tiburon and not contains matches", async () => {
    renderMap();

    const searchInput = await screen.findByRole("combobox", {
      name: "Search locations",
    });
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Ti" } });

    const results = await screen.findByTestId("map-phone-portrait-search-results");
    expect(
      within(results).getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Tiburon"]);
    expect(within(results).queryByText("Cupertino")).toBeNull();
    expect(within(results).queryByText("Stinson Beach")).toBeNull();
  });

  it("does not render the interactive search chrome on desktop", async () => {
    useMinWidthMock.mockReturnValue(true);
    usePhonePortraitMock.mockReturnValue(false);
    renderMap();

    await screen.findByTestId("bay-area-map");
    expect(
      screen.queryByTestId("map-phone-portrait-search-bar"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Search locations" }),
    ).not.toBeInTheDocument();
  });
});

describe("BayAreaMap search camera handle (no search-specific constants)", () => {
  it("fitAllBayView and focusLocation reuse existing viewport helpers", async () => {
    // Static architecture check: the handle methods must call the shared
    // helpers rather than invent search-only bounds/zoom.
    const source = readFileSync(
      join(process.cwd(), "components/map/BayAreaMap.tsx"),
      "utf8",
    );

    expect(source).toContain("focusMapOnLocation(map, longitude, latitude)");
    expect(source).toContain(
      "fitPhonePortraitRegionViewport(map, null, { duration: 450 })",
    );
    expect(source).not.toMatch(/SEARCH_.*(?:ZOOM|BOUNDS|CENTER|PADDING)/i);
    expect(source).not.toMatch(/searchSpecific/i);
  });
});
