// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";

import { getProductRegionIdForLocation } from "@/lib/map/regions";
import type { MapMarkerLocation } from "@/lib/map/markers";
import {
  getPhonePortraitMarkerPriority,
  PHONE_PORTRAIT_LOW_ZOOM_ICON_ONLY_LOCATION_IDS,
} from "@/lib/map/phonePortraitMapPresentation";
import {
  createPhonePortraitMapMarkerElement,
  declutterPhonePortraitMarkers,
  type PhonePortraitDeclutterEntry,
} from "@/lib/map/phonePortraitMarkers";

/**
 * Canonical low-zoom visibility contract (Phase X, extends audit RC-4).
 *
 * The SF/coastal low-zoom set only applies in the wide all-Bay composition, and
 * it now expresses the canonical `icon-only` visibility state — the weather icon
 * keeps its geographic presence while the label/score are suppressed. It is no
 * longer a whole-marker hide table. Inside a specific region camera the region's
 * own members stay eligible. A member chosen as its region's representative
 * anchor is promoted back to a label.
 */

function makeEntry(
  location: MapMarkerLocation,
  center: { x: number; y: number },
): PhonePortraitDeclutterEntry {
  const element = createPhonePortraitMapMarkerElement({
    location,
    isSelected: false,
    showLocationLabel: true,
    onSelect: () => {},
  });
  document.body.append(element);

  // Give each label/score group a distinct, non-colliding position so the test
  // isolates low-zoom behavior from collision decluttering. Icons are left with
  // degenerate (zero-size) geometry so icon collision is skipped.
  const meta = element.querySelector<HTMLElement>(
    ".karl-universal-map-marker__meta",
  )!;
  vi.spyOn(meta, "getBoundingClientRect").mockReturnValue({
    left: center.x - 10,
    top: center.y - 10,
    width: 20,
    height: 20,
    right: center.x + 10,
    bottom: center.y + 10,
    x: center.x - 10,
    y: center.y - 10,
    toJSON: () => ({}),
  } as DOMRect);

  return {
    locationId: location.id,
    element,
    priority: getPhonePortraitMarkerPriority(location.id),
    score: location.sunshineScore,
    isSelected: false,
    productRegionId: getProductRegionIdForLocation(location),
  };
}

function mapAtZoom(zoom: number) {
  return { getZoom: () => zoom } as unknown as import("maplibre-gl").Map;
}

const marinHeadlands: MapMarkerLocation = {
  id: "marin-headlands",
  name: "Marin Headlands",
  latitude: 37.827,
  longitude: -122.499,
  sunshineScore: 47,
  status: "Foggy",
  region: "north-bay",
};
const tiburon: MapMarkerLocation = {
  id: "tiburon",
  name: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  sunshineScore: 60,
  status: "Clear",
  region: "north-bay",
};
const berkeley: MapMarkerLocation = {
  id: "berkeley",
  name: "Berkeley",
  latitude: 37.8715,
  longitude: -122.273,
  sunshineScore: 84,
  status: "Clear",
  region: "east-bay",
};

describe("phone-portrait low-zoom visibility", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("keeps marin-headlands in the canonical low-zoom set", () => {
    expect(
      PHONE_PORTRAIT_LOW_ZOOM_ICON_ONLY_LOCATION_IDS.has("marin-headlands"),
    ).toBe(true);
    // Phantom duplicate removed during Tier A hygiene.
    expect(
      PHONE_PORTRAIT_LOW_ZOOM_ICON_ONLY_LOCATION_IDS.has("ocean-beach-sf"),
    ).toBe(false);
  });

  it("downgrades a low-zoom-set member to icon-only (not hidden) in the all-Bay composition", () => {
    // Tiburon is the North Bay anchor, so marin-headlands is a secondary
    // low-zoom-set member and must become icon-only (icon kept, label dropped).
    const entries = [
      makeEntry(tiburon, { x: 100, y: 100 }),
      makeEntry(marinHeadlands, { x: 300, y: 300 }),
      makeEntry(berkeley, { x: 500, y: 500 }),
    ];

    declutterPhonePortraitMarkers(mapAtZoom(9.19), entries, {
      applyLowZoomHiding: true,
    });

    const marin = entries[1]!.element;
    expect(marin.style.display).not.toBe("none");
    expect(marin.dataset.markerVisibility).toBe("icon-only");
    // Non-low-zoom members keep their labels.
    expect(entries[0]!.element.dataset.markerVisibility).toBe("full");
    expect(entries[2]!.element.dataset.markerVisibility).toBe("full");
  });

  it("promotes a low-zoom-set member to a full label when it is its region's anchor", () => {
    // With no higher-priority North Bay member present, marin-headlands is the
    // North Bay anchor and is exempt from low-zoom label suppression.
    const entries = [
      makeEntry(marinHeadlands, { x: 100, y: 100 }),
      makeEntry(berkeley, { x: 400, y: 400 }),
    ];

    declutterPhonePortraitMarkers(mapAtZoom(9.19), entries, {
      applyLowZoomHiding: true,
    });

    expect(entries[0]!.element.dataset.markerVisibility).toBe("full");
    expect(entries[1]!.element.dataset.markerVisibility).toBe("full");
  });

  it("keeps a region's own low-zoom-set member fully labeled in its region camera", () => {
    const entries = [
      makeEntry(marinHeadlands, { x: 100, y: 100 }),
      makeEntry(berkeley, { x: 300, y: 300 }),
    ];

    // North Bay camera resolves below the threshold but must still fully show
    // Marin Headlands (region views do not apply low-zoom suppression).
    declutterPhonePortraitMarkers(mapAtZoom(9.19), entries, {
      applyLowZoomHiding: false,
    });

    expect(entries[0]!.element.dataset.markerVisibility).toBe("full");
    expect(entries[1]!.element.dataset.markerVisibility).toBe("full");
  });

  it("does not low-zoom suppress at or above the threshold even in all-Bay", () => {
    const entries = [
      makeEntry(tiburon, { x: 100, y: 100 }),
      makeEntry(marinHeadlands, { x: 300, y: 300 }),
    ];

    declutterPhonePortraitMarkers(mapAtZoom(10.3), entries, {
      applyLowZoomHiding: true,
    });

    expect(entries[1]!.element.dataset.markerVisibility).toBe("full");
  });
});
