// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  sunshineScore: 40,
  fogScore: 82,
  status: "Karl Territory",
};

describe("createMapMarkerElement", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("classifies clear-qualified locations as Clear markers even in the raw Light Fog band", () => {
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
    expect(marker.className).not.toContain("karl-map-marker--lightFog");
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

  it("includes fallback wording in the aria-label for degraded locations", () => {
    const marker = createMapMarkerElement({
      location: {
        ...tiburon,
        dataStatus: {
          source: "degraded",
          isDegraded: true,
          lastLiveObservationAt: null,
          freshnessMinutes: null,
        },
      },
      isSelected: false,
      fogLayerEnabled: true,
      onSelect: vi.fn(),
    });

    expect(marker.getAttribute("aria-label")).toContain("using fallback conditions");
  });

  it("does not include fallback wording in the aria-label for live locations", () => {
    const marker = createMapMarkerElement({
      location: {
        ...tiburon,
        dataStatus: {
          source: "live",
          isDegraded: false,
          lastLiveObservationAt: "2026-07-04T05:35:00+00:00",
          freshnessMinutes: 28,
        },
      },
      isSelected: false,
      fogLayerEnabled: true,
      onSelect: vi.fn(),
    });

    expect(marker.getAttribute("aria-label")).not.toContain("fallback");
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
      location: {
        ...tiburon,
        fogScore: 82,
        sunshineScore: 40,
      },
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
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

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

  it("adds portable styling for clear markers on immersive layout", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const marker = createMapMarkerElement({
      location: {
        id: "mountain-view",
        name: "Mountain View",
        latitude: 37.3861,
        longitude: -122.0839,
        fogScore: 10,
        sunshineScore: 90,
        status: "Clear",
      },
      isSelected: false,
      fogLayerEnabled: true,
      layout: "immersive",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--portable");
    expect(marker.className).toContain("karl-map-marker--clear");
    expect(marker.className).toContain("text-karl-gold");
    expect(marker.innerHTML).toContain('circle cx="12" cy="12"');
  });

  it("keeps desktop clear markers on the default circular marker chrome", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const marker = createMapMarkerElement({
      location: {
        id: "mountain-view",
        name: "Mountain View",
        latitude: 37.3861,
        longitude: -122.0839,
        fogScore: 10,
        sunshineScore: 90,
        status: "Clear",
      },
      isSelected: false,
      fogLayerEnabled: true,
      layout: "desktop",
      onSelect: vi.fn(),
    });

    expect(marker.className).not.toContain("karl-map-marker--portable");
    expect(marker.className).toContain("karl-map-marker--clear");
    expect(marker.className).not.toContain("text-karl-gold");
  });

  it("does not apply a selected ring to portable clear sunny markers", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const marker = createMapMarkerElement({
      location: {
        id: "mountain-view",
        name: "Mountain View",
        latitude: 37.3861,
        longitude: -122.0839,
        fogScore: 10,
        sunshineScore: 90,
        status: "Clear",
      },
      isSelected: true,
      fogLayerEnabled: true,
      layout: "immersive",
      onSelect: vi.fn(),
    });

    const markerCss = readFileSync(
      resolve(process.cwd(), "app/globals.css"),
      "utf8",
    );

    expect(marker.className).toContain("is-selected");
    expect(marker.className).toContain("karl-map-marker--clear");
    expect(marker.className).toContain("text-karl-gold");
    expect(marker.className).toContain("karl-map-marker--portable");
    expect(markerCss).toContain(
      ".karl-map-marker--portable.karl-map-marker--clear.is-selected",
    );
    expect(markerCss).toMatch(
      /\.karl-map-marker--portable\.karl-map-marker--clear\.is-selected[\s\S]*box-shadow: none;/,
    );
  });

  it("uses larger portable sizing for clear sunny marker icons", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const marker = createMapMarkerElement({
      location: {
        id: "mountain-view",
        name: "Mountain View",
        latitude: 37.3861,
        longitude: -122.0839,
        fogScore: 10,
        sunshineScore: 90,
        status: "Clear",
      },
      isSelected: false,
      fogLayerEnabled: true,
      layout: "immersive",
      onSelect: vi.fn(),
    });

    const markerCss = readFileSync(
      resolve(process.cwd(), "app/globals.css"),
      "utf8",
    );

    expect(marker.className).toContain("karl-map-marker--portable");
    expect(marker.className).toContain("karl-map-marker--clear");
    expect(marker.className).toContain("text-karl-gold");
    expect(marker.querySelector(".karl-map-marker__svg")).toBeTruthy();
    expect(markerCss).toMatch(
      /\.karl-map-marker--portable\.karl-map-marker--clear[\s\S]*height: 3rem;/,
    );
    expect(markerCss).toMatch(
      /\.karl-map-marker--portable\.karl-map-marker--clear[\s\S]*border-radius: 0;/,
    );
  });

  it("keeps fog marker chrome on portable layout", () => {
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
      layout: "immersive",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--portable");
    expect(marker.className).toContain("karl-map-marker--foggy");
    expect(marker.className).not.toContain("text-karl-gold");
    expect(marker.innerHTML).toContain('stroke="#93B8D8"');
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

const tiburonClearSkyBand: MapMarkerLocation = {
  id: "tiburon",
  name: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  sunshineScore: 82,
  fogScore: 26,
  status: "Mostly Sunny",
};

const moderateFogLocation: MapMarkerLocation = {
  id: "moderate-fog",
  name: "Moderate Fog",
  latitude: 37.5,
  longitude: -122.2,
  sunshineScore: 55,
  fogScore: 35,
  status: "Light Fog",
};

describe("user-facing display intensity", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders Tiburon-like data as Clear in the default unfiltered map", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const marker = createMapMarkerElement({
      location: tiburonClearSkyBand,
      isSelected: false,
      fogLayerEnabled: true,
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--clear");
    expect(marker.className).not.toContain("karl-map-marker--lightFog");
    expect(marker.getAttribute("aria-label")).toBe("Tiburon, Clear");
    expect(marker.innerHTML).toContain('circle cx="12" cy="12"');
    expect(marker.innerHTML).not.toContain('ellipse cx="12" cy="11"');
  });

  it("renders Tiburon-like data as Clear when the Clear filter is active", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const marker = createMapMarkerElement({
      location: tiburonClearSkyBand,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "clear",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("karl-map-marker--clear");
    expect(marker.className).toContain("is-intensity-match");
    expect(marker.className).not.toContain("karl-map-marker--lightFog");
    expect(marker.getAttribute("aria-label")).toBe("Tiburon, Clear");
  });

  it("keeps moderate fog below the Clear sunshine threshold in Light Fog styling", () => {
    const clearFilterMarker = createMapMarkerElement({
      location: moderateFogLocation,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "clear",
      onSelect: vi.fn(),
    });
    const lightFogFilterMarker = createMapMarkerElement({
      location: moderateFogLocation,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "lightFog",
      onSelect: vi.fn(),
    });
    const defaultMarker = createMapMarkerElement({
      location: moderateFogLocation,
      isSelected: false,
      fogLayerEnabled: true,
      onSelect: vi.fn(),
    });

    expect(clearFilterMarker.className).toContain("is-filtered-hidden");
    expect(lightFogFilterMarker.className).toContain("karl-map-marker--lightFog");
    expect(lightFogFilterMarker.className).toContain("is-intensity-match");
    expect(defaultMarker.className).toContain("karl-map-marker--lightFog");
    expect(defaultMarker.getAttribute("aria-label")).toBe(
      "Moderate Fog, Light Fog",
    );
  });

  it("renders a mix of Clear, Light Fog, Foggy, and Karl Territory on the default map", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00"));

    const scenarios = [
      {
        location: tiburonClearSkyBand,
        expectedClass: "karl-map-marker--clear",
        expectedAria: "Tiburon, Clear",
      },
      {
        location: moderateFogLocation,
        expectedClass: "karl-map-marker--lightFog",
        expectedAria: "Moderate Fog, Light Fog",
      },
      {
        location: {
          id: "sausalito",
          name: "Sausalito",
          latitude: 37.8591,
          longitude: -122.4853,
          sunshineScore: 40,
          fogScore: 60,
          status: "Foggy",
        },
        expectedClass: "karl-map-marker--foggy",
        expectedAria: "Sausalito, Foggy",
      },
      {
        location: {
          id: "ocean-beach",
          name: "Ocean Beach",
          latitude: 37.7594,
          longitude: -122.5107,
          sunshineScore: 18,
          fogScore: 96,
          status: "Karl Territory",
        },
        expectedClass: "karl-map-marker--karlTerritory",
        expectedAria: "Ocean Beach, Karl Territory",
      },
    ] as const;

    for (const scenario of scenarios) {
      const marker = createMapMarkerElement({
        location: scenario.location,
        isSelected: false,
        fogLayerEnabled: true,
        onSelect: vi.fn(),
      });

      expect(marker.className).toContain(scenario.expectedClass);
      expect(marker.getAttribute("aria-label")).toBe(scenario.expectedAria);
    }
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

  it("shows Marin Headlands when North Bay and Karl Territory filters are combined", () => {
    const marinHeadlands: MapMarkerLocation = {
      id: "marin-headlands",
      name: "Marin Headlands / Hawk Hill",
      latitude: 37.827,
      longitude: -122.499,
      fogScore: 100,
      sunshineScore: 8,
      status: "Karl Territory",
      region: "north-bay",
    };

    expect(
      isMapMarkerVisible(marinHeadlands, {
        intensityFilter: "karlTerritory",
        selectedRegionId: "north-bay",
      }),
    ).toBe(true);

    const marker = createMapMarkerElement({
      location: marinHeadlands,
      isSelected: false,
      fogLayerEnabled: true,
      intensityFilter: "karlTerritory",
      selectedRegionId: "north-bay",
      onSelect: vi.fn(),
    });

    expect(marker.className).toContain("is-intensity-match");
    expect(marker.className).not.toContain("is-filtered-hidden");
  });
});
