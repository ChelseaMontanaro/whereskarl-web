// @vitest-environment happy-dom

import "../mocks/maplibre-gl";

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BayAreaMap } from "@/components/map/BayAreaMap";
import type { MapMarkerLocation } from "@/lib/map/markers";
import { getPhonePortraitMarkerOffset } from "@/lib/map/phonePortraitMapPresentation";

/**
 * Verifies the safe anchor correctness fix: the phone-portrait marker's weather
 * icon must sit on the true coordinate. MapLibre centers the whole marker box
 * (icon → label → score), so BayAreaMap measures the icon's position within the
 * box and offsets the marker to cancel that drift. The intentional per-location
 * declutter nudge is preserved on top.
 *
 * happy-dom reports zero-sized rects, so we stub a realistic marker layout: a
 * 74px-tall stack with the 36px weather icon flush to the top. That puts the
 * icon center 19px above the stack center — exactly the drift the fix removes.
 */
const ICON = { left: 122, top: 200, width: 36, height: 36 } as const;
const ROOT = { left: 100, top: 200, width: 80, height: 74 } as const;

const ICON_CENTER = {
  x: ICON.left + ICON.width / 2,
  y: ICON.top + ICON.height / 2,
};
const ROOT_CENTER = {
  x: ROOT.left + ROOT.width / 2,
  y: ROOT.top + ROOT.height / 2,
};
// The fixed offset of the icon center relative to the stack center.
const ICON_MINUS_ROOT = {
  x: ICON_CENTER.x - ROOT_CENTER.x,
  y: ICON_CENTER.y - ROOT_CENTER.y,
};

function makeRect(box: {
  left: number;
  top: number;
  width: number;
  height: number;
}): DOMRect {
  const rect = {
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    right: box.left + box.width,
    bottom: box.top + box.height,
    x: box.left,
    y: box.top,
  };
  return { ...rect, toJSON: () => rect } as DOMRect;
}

const locations: MapMarkerLocation[] = [
  { id: "ocean-beach", name: "Ocean Beach", latitude: 37.7594, longitude: -122.5107, sunshineScore: 40, fogScore: 70, status: "Patchy Fog" },
  { id: "tiburon", name: "Tiburon", latitude: 37.8735, longitude: -122.4566, sunshineScore: 82, fogScore: 20, status: "Clear" },
  { id: "sausalito", name: "Sausalito", latitude: 37.8591, longitude: -122.4853, sunshineScore: 74, fogScore: 41, status: "Patchy Fog" },
  { id: "berkeley", name: "Berkeley", latitude: 37.8716, longitude: -122.2727, sunshineScore: 80, fogScore: 25, status: "Clear" },
  { id: "oakland", name: "Oakland", latitude: 37.8044, longitude: -122.2712, sunshineScore: 78, fogScore: 30, status: "Clear" },
  { id: "san-jose", name: "San Jose", latitude: 37.3382, longitude: -121.8863, sunshineScore: 90, fogScore: 8, status: "Clear" },
];

const defaultProps = {
  mapStyle: "standard" as const,
  fogLayerEnabled: false,
  onMapStyleChange: vi.fn(),
  onFogLayerChange: vi.fn(),
};

describe("BayAreaMap phone-portrait icon anchoring", () => {
  let rectSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    // The mock's project() returns {x:0,y:0} for every coordinate, so screen
    // positions are measured relative to the projected coordinate origin.
    rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getBoundingClientRect(this: HTMLElement) {
        if (this.classList.contains("karl-universal-map-marker-root")) {
          return makeRect(ROOT);
        }
        if (this.classList.contains("karl-universal-map-marker")) {
          return makeRect(ICON);
        }
        return makeRect({ left: 0, top: 0, width: 0, height: 0 });
      });
  });

  afterEach(() => {
    rectSpy.mockRestore();
    cleanup();
    document.body.innerHTML = "";
  });

  it("centers the weather icon on the true coordinate (plus the intended declutter nudge)", async () => {
    render(
      <BayAreaMap
        locations={locations}
        selectedLocationId={null}
        selectedRegionId="san-francisco"
        onSelectLocation={vi.fn()}
        {...defaultProps}
        layout="immersive"
        immersiveOverlayProfile="phone-portrait"
      />,
    );

    await waitFor(() => {
      expect(
        document.querySelector(
          '.karl-universal-map-marker-root[data-location-id="oakland"]',
        ),
      ).not.toBeNull();
    });

    for (const location of locations) {
      const root = document.querySelector<HTMLElement>(
        `.karl-universal-map-marker-root[data-location-id="${location.id}"]`,
      );
      expect(root, `missing marker root for ${location.id}`).not.toBeNull();

      const applied = JSON.parse(
        root!.dataset.markerOffset ?? "null",
      ) as [number, number] | null;
      expect(applied, `no offset applied for ${location.id}`).not.toBeNull();

      // MapLibre pins the stack center at (projected coordinate + applied
      // offset). The icon center is fixed relative to that stack center, so:
      const iconCenter = {
        x: applied![0] + ICON_MINUS_ROOT.x,
        y: applied![1] + ICON_MINUS_ROOT.y,
      };

      // The icon should land on the coordinate origin (0,0) plus only the
      // intentional per-location declutter nudge — no leftover anchor drift.
      const nudge = getPhonePortraitMarkerOffset(location.id);
      expect(iconCenter.x).toBeCloseTo(nudge[0], 5);
      expect(iconCenter.y).toBeCloseTo(nudge[1], 5);
    }
  });
});
