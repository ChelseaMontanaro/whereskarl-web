// @vitest-environment happy-dom

import "../mocks/maplibre-gl";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BayAreaMap } from "@/components/map/BayAreaMap";
import type { MapMarkerLocation } from "@/lib/map/markers";
import { mockFitBounds, mockFlyTo } from "../mocks/maplibre-gl";

const locations: MapMarkerLocation[] = [
  {
    id: "tiburon",
    name: "Tiburon",
    latitude: 37.8735,
    longitude: -122.4566,
    sunshineScore: 82,
  },
  {
    id: "sausalito",
    name: "Sausalito",
    latitude: 37.8591,
    longitude: -122.4853,
    sunshineScore: 74,
  },
];

describe("BayAreaMap", () => {
  afterEach(() => {
    cleanup();
    mockFlyTo.mockClear();
    mockFitBounds.mockClear();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the map container without crashing", async () => {
    render(
      <BayAreaMap
        locations={locations}
        selectedLocationId={null}
        selectedRegionId={null}
        onSelectLocation={vi.fn()}
      />,
    );

    expect(await screen.findByTestId("bay-area-map")).toBeInTheDocument();
  });

  it("frames the default four-region Bay Area viewport when no location is selected", async () => {
    render(
      <BayAreaMap
        locations={locations}
        selectedLocationId={null}
        selectedRegionId={null}
        onSelectLocation={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockFitBounds).toHaveBeenCalled();
    });
    expect(mockFlyTo).not.toHaveBeenCalled();
  });

  it("focuses the selected location on the map", async () => {
    render(
      <BayAreaMap
        locations={locations}
        selectedLocationId="tiburon"
        selectedRegionId={null}
        onSelectLocation={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockFlyTo).toHaveBeenCalledWith(
        expect.objectContaining({
          center: [-122.4566, 37.8735],
        }),
      );
    });
  });

  it("updates selection when a marker is clicked", async () => {
    const onSelectLocation = vi.fn();

    render(
      <BayAreaMap
        locations={locations}
        selectedLocationId="tiburon"
        selectedRegionId={null}
        onSelectLocation={onSelectLocation}
      />,
    );

    const sausalitoMarker = await screen.findByTestId("map-marker-sausalito");
    fireEvent.click(sausalitoMarker);

    expect(onSelectLocation).toHaveBeenCalledWith("sausalito");
  });
});
