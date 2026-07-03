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
      onSelect,
    });

    fireEvent.click(marker);

    expect(onSelect).toHaveBeenCalledWith("tiburon");
    expect(marker.className).toBe("karl-map-marker");
  });

  it("marks the selected marker as pressed", () => {
    const marker = createMapMarkerElement({
      location: tiburon,
      isSelected: true,
      onSelect: vi.fn(),
    });

    expect(marker.className).toBe("karl-map-marker is-selected");
    expect(marker.getAttribute("aria-pressed")).toBe("true");
  });
});
