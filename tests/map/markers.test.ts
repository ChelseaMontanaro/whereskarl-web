// @vitest-environment happy-dom

import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  createMapMarkerElement,
  getMapMarkerPlacementOptions,
  isMapMarkerVisible,
  shouldShowFoggyFilterMarkerLabel,
  type MapMarkerLocation,
} from "@/lib/map/markers";
import { buildMapHref } from "@/lib/map/routing";

const tiburon: MapMarkerLocation = {
  id: "tiburon",
  name: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  sunshineScore: 82,
  fogScore: 82,
  status: "Karl Territory",
};

describe("createMapMarkerElement", () => {
  it("creates a marker href target through map routing helpers", () => {
    expect(buildMapHref(tiburon.id)).toBe("/map?location=tiburon");
  });

  it("selects a location when the marker is clicked", () => {
    const onSelect = vi.fn();

    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: false,
      fogLayerEnabled: true,
      onSelect,
    });

    fireEvent.click(marker);

    expect(onSelect).toHaveBeenCalledWith("tiburon");
    expect(marker.className).toContain("karl-map-marker--karlTerritory");
  });

  it("uses the Karl brand logo for Karl Territory markers", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: false,
      fogLayerEnabled: true,
      onSelect: vi.fn(),
    });

    expect(marker.innerHTML).toContain("/brand/wheres-karl-logo@2x.png");
    expect(marker.innerHTML).not.toContain("stroke=\"#93B8D8\"");
  });

  it("uses a foggy cloud icon for foggy conditions", () => {
    const marker = createMapMarkerElement({
      location: {
        ...tiburon,
        id: "sausalito",
        name: "Sausalito",
        fogScore: 60,
        sunshineScore: 40,
      },
      isSelected: false,
      fogLayerEnabled: true,
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--foggy");
    expect(marker.innerHTML).toContain("stroke=\"#93B8D8\"");
    expect(marker.innerHTML).not.toContain("/brand/wheres-karl-logo@2x.png");
  });

  it("keeps condition-specific icons when an intensity filter is active", () => {
    const marker = createMapMarkerElement({
      location: {
        ...tiburon,
        fogScore: 10,
        sunshineScore: 90,
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "karlTerritory",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("is-filtered-out");
    expect(marker.className).toContain("karl-map-marker--clear");
    expect(marker.innerHTML).not.toContain("/brand/wheres-karl-logo@2x.png");
  });

  it("marks the selected marker as pressed", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: true,
      fogLayerEnabled: false,
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker");
    expect(marker.className).toContain("is-selected");
    expect(marker.className).toContain("karl-map-marker--karlTerritory");
    expect(marker.getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps real condition icons when the fog overlay is hidden", () => {
    const marker = createMapMarkerElement({
      location: {
        ...tiburon,
        fogScore: 10,
        sunshineScore: 90,
      },
      isSelected: false,
      fogLayerEnabled: false,
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--clear");
    expect(marker.className).not.toContain("karl-map-marker--lightFog");
  });

  it("classifies high-sunshine locations as clear markers", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "tiburon",
        name: "Tiburon",
        latitude: 37.8735,
        longitude: -122.4566,
        fogScore: 26,
        sunshineScore: 82,
        status: "Mostly Sunny",
      },
      isSelected: false,
      fogLayerEnabled: true,
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--clear");
  });

  it("uses shared condition language in the marker label", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: false,
      fogLayerEnabled: true,
      onSelect: vi.fn(),
    });

    expect(marker.getAttribute("aria-label")).toContain("Karl Territory");
  });

  it("hides non-Karl markers when the Karl Territory filter is active", () => {
    const marker = createMapMarkerElement({
      location: {
        ...tiburon,
        fogScore: 10,
        sunshineScore: 90,
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "karlTerritory",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("is-filtered-hidden");
    expect(marker.className).toContain("is-filtered-out");
  });

  it("hides non-clear markers when the Clear filter is active", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "clear",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("is-filtered-hidden");
    expect(marker.className).toContain("is-filtered-out");
    expect(marker.className).toContain("karl-map-marker--karlTerritory");
  });

  it("shows sun icons for clear locations when the Clear filter is active", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "san-jose",
        name: "San Jose",
        latitude: 37.3382,
        longitude: -121.8863,
        fogScore: 10,
        sunshineScore: 90,
        status: "Clear",
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "clear",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--clear");
    expect(marker.className).toContain("is-intensity-match");
    expect(marker.className).not.toContain("is-filtered-out");
    expect(marker.innerHTML).toContain('circle cx="12" cy="12"');
    expect(marker.innerHTML).not.toContain("/brand/wheres-karl-logo@2x.png");
  });

  it("hides non-light-fog markers when the Light Fog filter is active", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "lightFog",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("is-filtered-hidden");
    expect(marker.className).toContain("is-filtered-out");
    expect(marker.className).toContain("karl-map-marker--karlTerritory");
  });

  it("shows light fog cloud icons for matching locations when the Light Fog filter is active", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "sausalito",
        name: "Sausalito",
        latitude: 37.8591,
        longitude: -122.4853,
        fogScore: 35,
        sunshineScore: 40,
        status: "Light Fog",
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "lightFog",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--lightFog");
    expect(marker.className).toContain("is-intensity-match");
    expect(marker.className).not.toContain("is-filtered-out");
    expect(marker.innerHTML).toContain('ellipse cx="12" cy="11"');
    expect(marker.innerHTML).not.toContain("/brand/wheres-karl-logo@2x.png");
    expect(marker.innerHTML).not.toContain('circle cx="12" cy="12"');
  });

  it("hides non-foggy markers when the Foggy filter is active", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "foggy",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("is-filtered-hidden");
    expect(marker.className).toContain("is-filtered-out");
    expect(marker.className).toContain("karl-map-marker--karlTerritory");
  });

  it("shows foggy cloud icons for matching locations when the Foggy filter is active", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "sausalito",
        name: "Sausalito",
        latitude: 37.8591,
        longitude: -122.4853,
        fogScore: 60,
        sunshineScore: 40,
        status: "Foggy",
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "foggy",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--foggy");
    expect(marker.className).toContain("is-intensity-match");
    expect(marker.className).not.toContain("is-filtered-out");
    expect(marker.className).not.toContain("is-filtered-hidden");
    expect(marker.innerHTML).toContain('stroke="#93B8D8"');
    expect(marker.innerHTML).not.toContain("/brand/wheres-karl-logo@2x.png");
    expect(marker.innerHTML).not.toContain('circle cx="12" cy="12"');
    expect(marker.querySelector(".karl-map-marker__label")).toBeNull();
  });

  it("shows readable location labels below foggy markers on desktop", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "sausalito",
        name: "Sausalito",
        latitude: 37.8591,
        longitude: -122.4853,
        fogScore: 60,
        sunshineScore: 40,
        status: "Foggy",
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "foggy",
      layout: "desktop",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker-root--labeled");
    expect(marker.querySelector(".karl-map-marker__label")?.textContent).toBe(
      "Sausalito",
    );
    expect(marker.querySelector(".karl-map-marker")?.className).toContain(
      "karl-map-marker--foggy",
    );
  });

  it("shows the full Golden Gate Park label on desktop foggy markers", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "golden-gate-park",
        name: "Golden Gate Park",
        latitude: 37.7694,
        longitude: -122.4862,
        fogScore: 60,
        sunshineScore: 40,
        status: "Foggy",
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "foggy",
      layout: "desktop",
      onSelect: vi.fn(),
    });

    expect(marker.querySelector(".karl-map-marker__label")?.textContent).toBe(
      "Golden Gate Park",
    );
  });

  it("does not add foggy filter labels on mobile", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "sausalito",
        name: "Sausalito",
        latitude: 37.8591,
        longitude: -122.4853,
        fogScore: 60,
        sunshineScore: 40,
        status: "Foggy",
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "foggy",
      layout: "mobile",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--foggy");
    expect(marker.querySelector(".karl-map-marker__label")).toBeNull();
  });

  it("preserves selected halo styling on labeled foggy desktop markers", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "sausalito",
        name: "Sausalito",
        latitude: 37.8591,
        longitude: -122.4853,
        fogScore: 60,
        sunshineScore: 40,
        status: "Foggy",
      },
      isSelected: true,
      fogLayerEnabled: true,
      intensityFilter: "foggy",
      layout: "desktop",
      onSelect: vi.fn(),
    });

    expect(marker.querySelector(".karl-map-marker")?.className).toContain(
      "is-selected",
    );
  });

  it("shows readable location labels below Karl Territory markers on desktop", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "karlTerritory",
      layout: "desktop",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker-root--labeled");
    expect(marker.querySelector(".karl-map-marker__label")?.textContent).toBe(
      "Tiburon",
    );
    expect(marker.querySelector(".karl-map-marker")?.className).toContain(
      "karl-map-marker--karlTerritory",
    );
  });

  it("does not add Karl Territory filter labels on mobile", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "karlTerritory",
      layout: "mobile",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--karlTerritory");
    expect(marker.querySelector(".karl-map-marker__label")).toBeNull();
  });

  it("preserves selected halo styling on labeled Karl Territory desktop markers", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: true,
      fogLayerEnabled: true,
      intensityFilter: "karlTerritory",
      layout: "desktop",
      onSelect: vi.fn(),
    });

    expect(marker.querySelector(".karl-map-marker")?.className).toContain(
      "is-selected",
    );
  });

  it("wraps Karl Territory markers when showLocationLabel is true", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "karlTerritory",
      showLocationLabel: true,
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker-root--labeled");
    expect(marker.querySelector(".karl-map-marker__label")?.textContent).toBe(
      "Tiburon",
    );
    expect(marker.querySelector(".karl-map-marker__logo")).not.toBeNull();
  });

  it("shows readable location labels below clear markers on desktop", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "san-jose",
        name: "San Jose",
        latitude: 37.3382,
        longitude: -121.8863,
        fogScore: 10,
        sunshineScore: 90,
        status: "Clear",
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "clear",
      layout: "desktop",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker-root--labeled");
    expect(marker.querySelector(".karl-map-marker__label")?.textContent).toBe(
      "San Jose",
    );
    expect(marker.querySelector(".karl-map-marker")?.className).toContain(
      "karl-map-marker--clear",
    );
  });

  it("shows readable location labels below light fog markers on desktop", () => {
    const marker = createMapMarkerElement({
      location: {
        id: "sausalito",
        name: "Sausalito",
        latitude: 37.8591,
        longitude: -122.4853,
        fogScore: 35,
        sunshineScore: 40,
        status: "Light Fog",
      },
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "lightFog",
      layout: "desktop",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker-root--labeled");
    expect(marker.querySelector(".karl-map-marker__label")?.textContent).toBe(
      "Sausalito",
    );
    expect(marker.querySelector(".karl-map-marker")?.className).toContain(
      "karl-map-marker--lightFog",
    );
  });
});

describe("shouldShowFoggyFilterMarkerLabel", () => {
  it("enables labels for visible matching markers on desktop for every intensity filter", () => {
    for (const intensity of [
      "clear",
      "lightFog",
      "foggy",
      "karlTerritory",
    ] as const) {
      expect(
        shouldShowFoggyFilterMarkerLabel("desktop", intensity, false),
      ).toBe(true);
      expect(
        shouldShowFoggyFilterMarkerLabel("mobile", intensity, false),
      ).toBe(false);
      expect(
        shouldShowFoggyFilterMarkerLabel("desktop", intensity, true),
      ).toBe(false);
    }

    expect(shouldShowFoggyFilterMarkerLabel("desktop", null, false)).toBe(
      false,
    );
  });
});

describe("getMapMarkerPlacementOptions", () => {
  it("offsets labeled markers so icons sit above names", () => {
    expect(getMapMarkerPlacementOptions(false)).toEqual({ anchor: "center" });
    expect(getMapMarkerPlacementOptions(true)).toEqual({
      anchor: "center",
      offset: [0, -11],
    });
  });

  it("uses the same showLocationLabel boolean for wrapper and placement offset", () => {
    const location = {
      id: "san-jose",
      name: "San Jose",
      latitude: 37.3382,
      longitude: -121.8863,
      fogScore: 10,
      sunshineScore: 90,
      status: "Clear",
    };
    const isFilteredOut = false;
    const showLocationLabel = shouldShowFoggyFilterMarkerLabel(
      "desktop",
      "clear",
      isFilteredOut,
    );

    const marker = createMapMarkerElement({
      location,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "clear",
      layout: "desktop",
      showLocationLabel,
      onSelect: vi.fn(),
    });
    const placement = getMapMarkerPlacementOptions(showLocationLabel);

    expect(showLocationLabel).toBe(true);
    expect(marker.className).toContain("karl-map-marker-root--labeled");
    expect(placement.offset).toEqual([0, -11]);
  });
});

describe("isMapMarkerVisible", () => {
  const sanFranciscoClear: MapMarkerLocation = {
    id: "presidio",
    name: "Presidio",
    latitude: 37.7989,
    longitude: -122.4662,
    fogScore: 10,
    sunshineScore: 90,
    status: "Clear",
  };

  const southBayClear: MapMarkerLocation = {
    id: "san-jose",
    name: "San Jose",
    latitude: 37.3382,
    longitude: -121.8863,
    fogScore: 10,
    sunshineScore: 90,
    status: "Clear",
  };

  const sanFranciscoFoggy: MapMarkerLocation = {
    id: "ocean-beach",
    name: "Ocean Beach",
    latitude: 37.7594,
    longitude: -122.5107,
    fogScore: 96,
    sunshineScore: 18,
    status: "Karl Territory",
  };

  it("shows all markers when only a region is selected", () => {
    expect(
      isMapMarkerVisible(sanFranciscoClear, {
        selectedRegionId: "san-francisco",
      }),
    ).toBe(true);
    expect(
      isMapMarkerVisible(southBayClear, {
        selectedRegionId: "san-francisco",
      }),
    ).toBe(true);
  });

  it("filters by intensity when only an intensity filter is selected", () => {
    expect(
      isMapMarkerVisible(sanFranciscoClear, {
        intensityFilter: "clear",
      }),
    ).toBe(true);
    expect(
      isMapMarkerVisible(sanFranciscoFoggy, {
        intensityFilter: "clear",
      }),
    ).toBe(false);
  });

  it("requires both region and intensity when both filters are active", () => {
    expect(
      isMapMarkerVisible(sanFranciscoClear, {
        intensityFilter: "clear",
        selectedRegionId: "san-francisco",
      }),
    ).toBe(true);
    expect(
      isMapMarkerVisible(southBayClear, {
        intensityFilter: "clear",
        selectedRegionId: "san-francisco",
      }),
    ).toBe(false);
    expect(
      isMapMarkerVisible(sanFranciscoFoggy, {
        intensityFilter: "clear",
        selectedRegionId: "san-francisco",
      }),
    ).toBe(false);
  });

  it("hides clear markers outside San Francisco when SF and Clear are selected", () => {
    const marker = createMapMarkerElement({
      location: southBayClear,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "clear",
      selectedRegionId: "san-francisco",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("is-filtered-hidden");
    expect(marker.className).not.toContain("is-intensity-match");
  });
});
