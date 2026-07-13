// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";

import type { MapMarkerLocation } from "@/lib/map/markers";
import {
  getPhonePortraitMarkerPriority,
  PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS,
} from "@/lib/map/phonePortraitMapPresentation";
import {
  createPhonePortraitMapMarkerElement,
  declutterPhonePortraitMarkers,
  type PhonePortraitDeclutterEntry,
} from "@/lib/map/phonePortraitMarkers";

/**
 * Canonical low-zoom visibility contract (audit RC-4).
 *
 * The SF/coastal low-zoom hidden set only declutters in the wide all-Bay
 * composition. Inside a specific region camera the region's own members stay
 * eligible, so a region view never hides its own monitored locations. The rule
 * set is retained (documented purpose) but scoped — it is not replaced by a new
 * hardcoded rule set.
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
  // isolates low-zoom hiding from collision decluttering.
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
};
const berkeley: MapMarkerLocation = {
  id: "berkeley",
  name: "Berkeley",
  latitude: 37.8715,
  longitude: -122.273,
  sunshineScore: 84,
  status: "Clear",
};

describe("phone-portrait low-zoom visibility scoping", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("keeps marin-headlands in the canonical low-zoom hidden set", () => {
    expect(PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS.has("marin-headlands")).toBe(
      true,
    );
    // Phantom duplicate removed during Tier A hygiene.
    expect(PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS.has("ocean-beach-sf")).toBe(
      false,
    );
  });

  it("hides low-zoom-set members in the all-Bay composition at low zoom", () => {
    const entries = [
      makeEntry(marinHeadlands, { x: 100, y: 100 }),
      makeEntry(berkeley, { x: 300, y: 300 }),
    ];

    declutterPhonePortraitMarkers(mapAtZoom(9.19), entries, {
      applyLowZoomHiding: true,
    });

    expect(entries[0]!.element.style.display).toBe("none");
    expect(entries[1]!.element.style.display).not.toBe("none");
  });

  it("keeps a region's own low-zoom-set member visible in its region camera", () => {
    const entries = [
      makeEntry(marinHeadlands, { x: 100, y: 100 }),
      makeEntry(berkeley, { x: 300, y: 300 }),
    ];

    // North Bay camera resolves below 9.9 but must still show Marin Headlands.
    declutterPhonePortraitMarkers(mapAtZoom(9.19), entries, {
      applyLowZoomHiding: false,
    });

    expect(entries[0]!.element.style.display).not.toBe("none");
    expect(entries[1]!.element.style.display).not.toBe("none");
  });

  it("does not low-zoom hide at or above the threshold even in all-Bay", () => {
    const entries = [makeEntry(marinHeadlands, { x: 100, y: 100 })];

    declutterPhonePortraitMarkers(mapAtZoom(10.3), entries, {
      applyLowZoomHiding: true,
    });

    expect(entries[0]!.element.style.display).not.toBe("none");
  });
});
