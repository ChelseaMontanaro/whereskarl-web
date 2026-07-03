// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapView, initialMapStyle } from "@/components/map/MapView";
import * as weatherApi from "@/lib/api/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");
const useSearchParamsMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: () => <div data-testid="bay-area-map" />,
}));

vi.mock("@/lib/hooks/useMinWidth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/hooks/useMinWidth")>();
  return {
    ...actual,
    useMinWidth: () => true,
  };
});

const tiburon = JSON.parse(
  readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"),
).locations[0];

function renderDesktopMap() {
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

describe("MapView desktop", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("defaults desktop map style to hybrid", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(min-width: 1024px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } as MediaQueryList);

    expect(initialMapStyle()).toBe("hybrid");
  });

  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue({
      locations: [
        tiburon,
        {
          ...tiburon,
          id: "san-jose",
          name: "San Jose",
          latitude: 37.3382,
          longitude: -121.8863,
          sunshineScore: 91,
          fogScore: 12,
          status: "Mostly Sunny",
          distanceText: "42 mi",
        },
      ],
    });
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "current.json"), "utf8")),
    );
  });

  it("routes Best Right Now clicks to the clicked location id", async () => {
    renderDesktopMap();

    fireEvent.click(
      await screen.findByRole("button", { name: "Select San Jose on map" }),
    );

    expect(replaceMock).toHaveBeenCalledWith("/map?location=san-jose", {
      scroll: false,
    });
    expect(replaceMock).not.toHaveBeenCalledWith("/map?location=tiburon", {
      scroll: false,
    });
  });
});
