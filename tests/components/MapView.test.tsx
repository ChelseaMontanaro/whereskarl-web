// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapView } from "@/components/map/MapView";
import * as weatherApi from "@/lib/api/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

const useSearchParamsMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: ({
    onSelectLocation,
  }: {
    onSelectLocation: (locationId: string) => void;
  }) => (
    <div data-testid="bay-area-map">
      <button
        type="button"
        data-testid="map-marker-sausalito"
        onClick={() => onSelectLocation("sausalito")}
      >
        Sausalito marker
      </button>
    </div>
  ),
}));

function renderMap() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MapView),
    ),
  );
}

describe("MapView", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8")),
    );
  });

  it("reads the selected location query param and shows the focused location", async () => {
    renderMap();

    expect(await screen.findByText("Focused on Tiburon.")).toBeInTheDocument();
    expect(screen.getByText("Selected Location")).toBeInTheDocument();
    expect(screen.getByTestId("bay-area-map")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "San Francisco" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "North Bay" })).toBeInTheDocument();
  });

  it("handles unknown selected locations without crashing", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("location=unknown-spot"),
    );

    renderMap();

    expect(await screen.findByText(/Couldn't find/i)).toBeInTheDocument();
    expect(screen.getByText(/unknown spot/i)).toBeInTheDocument();
    expect(screen.queryByText("Selected Location")).not.toBeInTheDocument();
    expect(screen.getByTestId("bay-area-map")).toBeInTheDocument();
  });

  it("updates the map route when a marker is selected", async () => {
    renderMap();

    fireEvent.click(await screen.findByTestId("map-marker-sausalito"));

    expect(replaceMock).toHaveBeenCalledWith("/map?location=sausalito", {
      scroll: false,
    });
  });
});
