// @vitest-environment happy-dom

import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  createMapMarkerElement,
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
});
