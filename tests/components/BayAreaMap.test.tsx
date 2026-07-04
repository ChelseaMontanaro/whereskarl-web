// @vitest-environment happy-dom

import "../mocks/maplibre-gl";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BayAreaMap } from "@/components/map/BayAreaMap";
import type { MapMarkerLocation } from "@/lib/map/markers";
import {
  mockAddLayer,
  mockAddSource,
  mockFitBounds,
  mockFlyTo,
  mockSetStyle,
} from "../mocks/maplibre-gl";

const locations: MapMarkerLocation[] = [
  {
    id: "tiburon",
    name: "Tiburon",
    latitude: 37.8735,
    longitude: -122.4566,
    sunshineScore: 82,
    fogScore: 82,
    status: "Karl Territory",
  },
  {
    id: "sausalito",
    name: "Sausalito",
    latitude: 37.8591,
    longitude: -122.4853,
    sunshineScore: 74,
    fogScore: 41,
    status: "Patchy Fog",
  },
];

const defaultProps = {
  mapStyle: "standard" as const,
  fogLayerEnabled: true,
  onMapStyleChange: vi.fn(),
  onFogLayerChange: vi.fn(),
};

describe("BayAreaMap", () => {
  afterEach(() => {
    cleanup();
    mockFlyTo.mockClear();
    mockFitBounds.mockClear();
    mockSetStyle.mockClear();
    mockAddSource.mockClear();
    mockAddLayer.mockClear();
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
        {...defaultProps}
      />,
    );

    expect(await screen.findByTestId("bay-area-map")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Map Layers" })).toBeInTheDocument();
  });

  it("frames the default four-region Bay Area viewport when no location is selected", async () => {
    render(
      <BayAreaMap
        locations={locations}
        selectedLocationId={null}
        selectedRegionId={null}
        onSelectLocation={vi.fn()}
        {...defaultProps}
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
        {...defaultProps}
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
        {...defaultProps}
      />,
    );

    const sausalitoMarker = await screen.findByTestId("map-marker-sausalito");
    fireEvent.click(sausalitoMarker);

    expect(onSelectLocation).toHaveBeenCalledWith("sausalito");
  });

  it("adds location-based fog overlays when the fog layer is enabled", async () => {
    render(
      <BayAreaMap
        locations={locations}
        selectedLocationId={null}
        selectedRegionId={null}
        onSelectLocation={vi.fn()}
        {...defaultProps}
        fogLayerEnabled
      />,
    );

    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled();
      expect(mockAddLayer).toHaveBeenCalled();
    });
  });

  it("removes fog overlays when the fog layer is disabled", async () => {
    const { rerender } = render(
      <BayAreaMap
        locations={locations}
        selectedLocationId={null}
        selectedRegionId={null}
        onSelectLocation={vi.fn()}
        {...defaultProps}
        fogLayerEnabled
      />,
    );

    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled();
    });

    rerender(
      <BayAreaMap
        locations={locations}
        selectedLocationId={null}
        selectedRegionId={null}
        onSelectLocation={vi.fn()}
        {...defaultProps}
        fogLayerEnabled={false}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByLabelText("Fog intensity legend")).not.toBeInTheDocument();
    });
  });

  it("changes the base map style safely", async () => {
    const onMapStyleChange = vi.fn();

    render(
      <BayAreaMap
        locations={locations}
        selectedLocationId={null}
        selectedRegionId={null}
        onSelectLocation={vi.fn()}
        {...defaultProps}
        onMapStyleChange={onMapStyleChange}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Map Layers" }));
    fireEvent.click(screen.getByRole("button", { name: "Satellite" }));

    expect(onMapStyleChange).toHaveBeenCalledWith("satellite");
  });

  it("shows glass-pill labels for visible Karl Territory markers on desktop", async () => {
    render(
      <BayAreaMap
        locations={[
          {
            id: "ocean-beach",
            name: "Ocean Beach",
            latitude: 37.7594,
            longitude: -122.5107,
            sunshineScore: 18,
            fogScore: 96,
            status: "Karl Territory",
          },
          {
            id: "san-jose",
            name: "San Jose",
            latitude: 37.3382,
            longitude: -121.8863,
            sunshineScore: 90,
            fogScore: 10,
            status: "Clear",
          },
        ]}
        selectedLocationId={null}
        selectedRegionId={null}
        onSelectLocation={vi.fn()}
        {...defaultProps}
        layout="desktop"
        intensityFilter="karlTerritory"
      />,
    );

    await waitFor(() => {
      expect(
        document.querySelector(".karl-map-marker-root--labeled"),
      ).not.toBeNull();
    });

    expect(
      document.querySelector(
        '[data-testid="map-marker-ocean-beach"]',
      )?.closest(".karl-map-marker-root--labeled"),
    ).not.toBeNull();
    expect(
      document.querySelector(
        '[data-location-id="ocean-beach"] .karl-map-marker__label',
      )?.textContent,
    ).toBe("Ocean Beach");
    expect(
      document.querySelector(
        '[data-testid="map-marker-san-jose"]',
      )?.closest(".karl-map-marker-root--labeled"),
    ).toBeNull();
  });
});
