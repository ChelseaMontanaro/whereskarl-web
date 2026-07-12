import { describe, expect, it } from "vitest";

import type { MapBounds } from "@/lib/map/config";
import {
  PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_PENINSULA_CAMERA,
  PHONE_PORTRAIT_SF_REGION_BOUNDS,
  PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS,
} from "@/lib/map/phonePortraitMapPresentation";
import { isLocationWithinProductRegionBounds } from "@/lib/map/regions";

const LOCATIONS = {
  sanFrancisco: { lat: 37.7749, lng: -122.4194 },
  presidio: { lat: 37.7989, lng: -122.4662 },
  goldenGatePark: { lat: 37.7694, lng: -122.4862 },
  oceanBeach: { lat: 37.7594, lng: -122.5107 },
  sausalito: { lat: 37.8591, lng: -122.4853 },
  tiburon: { lat: 37.8735, lng: -122.4566 },
  millValley: { lat: 37.9061, lng: -122.545 },
  sanRafael: { lat: 37.9735, lng: -122.5311 },
  stinsonBeach: { lat: 37.8439, lng: -122.6437 },
  marinHeadlands: { lat: 37.827, lng: -122.499 },
  berkeley: { lat: 37.8716, lng: -122.2727 },
  oakland: { lat: 37.8044, lng: -122.2712 },
  paloAlto: { lat: 37.4419, lng: -122.143 },
  mountainView: { lat: 37.3861, lng: -122.0839 },
  sanJose: { lat: 37.3382, lng: -121.8863 },
  fosterCity: { lat: 37.5585, lng: -122.271 },
  fremont: { lat: 37.5485, lng: -121.9886 },
} as const;

function contains(bounds: MapBounds, point: { lat: number; lng: number }) {
  return isLocationWithinProductRegionBounds(point.lat, point.lng, bounds);
}

describe("phone-portrait region camera geography", () => {
  it("frames San Francisco on the city, not the southern Peninsula or open Bay", () => {
    const bounds = PHONE_PORTRAIT_SF_REGION_BOUNDS;
    const [[west, south], [east, north]] = bounds;

    expect(contains(bounds, LOCATIONS.sanFrancisco)).toBe(true);
    expect(contains(bounds, LOCATIONS.presidio)).toBe(true);
    expect(contains(bounds, LOCATIONS.goldenGatePark)).toBe(true);
    expect(contains(bounds, LOCATIONS.oceanBeach)).toBe(true);

    // Thin southern-Marin context only — SF stays the subject.
    expect(contains(bounds, LOCATIONS.sausalito)).toBe(true);
    expect(contains(bounds, LOCATIONS.millValley)).toBe(false);
    expect(contains(bounds, LOCATIONS.sanRafael)).toBe(false);

    // Does not drift south into the Peninsula (San Bruno ≈ 37.63).
    expect(south).toBeGreaterThanOrEqual(37.7);
    // Does not prioritize Marin over SF.
    expect(north).toBeLessThanOrEqual(37.9);
    expect(west).toBeLessThanOrEqual(-122.5);
    expect(east).toBeGreaterThanOrEqual(-122.39);
  });

  it("frames the East Bay shoreline tightly around Berkeley and Oakland", () => {
    const bounds = PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS;
    const [[, south], [east]] = bounds;

    expect(contains(bounds, LOCATIONS.berkeley)).toBe(true);
    expect(contains(bounds, LOCATIONS.oakland)).toBe(true);

    // Does not sprawl inland to the Tri-Valley or south to Fremont.
    expect(east).toBeLessThanOrEqual(-122.1);
    expect(south).toBeGreaterThanOrEqual(37.6);
    expect(contains(bounds, LOCATIONS.fremont)).toBe(false);
  });

  it("frames the South Bay on the Silicon Valley corridor", () => {
    const bounds = PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS;
    const [, [, north]] = bounds;

    expect(contains(bounds, LOCATIONS.paloAlto)).toBe(true);
    expect(contains(bounds, LOCATIONS.mountainView)).toBe(true);
    expect(contains(bounds, LOCATIONS.sanJose)).toBe(true);

    // Does not creep north onto the mid-Peninsula / Foster City.
    expect(north).toBeLessThanOrEqual(37.5);
    expect(contains(bounds, LOCATIONS.fosterCity)).toBe(false);
  });

  it("keeps the North Bay framed on Marin", () => {
    const bounds = PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS;

    expect(contains(bounds, LOCATIONS.sausalito)).toBe(true);
    expect(contains(bounds, LOCATIONS.tiburon)).toBe(true);
    expect(contains(bounds, LOCATIONS.millValley)).toBe(true);
    expect(contains(bounds, LOCATIONS.sanRafael)).toBe(true);
    expect(contains(bounds, LOCATIONS.stinsonBeach)).toBe(true);
    expect(contains(bounds, LOCATIONS.marinHeadlands)).toBe(true);

    // Does not drift east into Richmond / the East Bay.
    expect(contains(bounds, LOCATIONS.berkeley)).toBe(false);
  });

  it("keeps the Peninsula preset on the land corridor", () => {
    expect(PHONE_PORTRAIT_PENINSULA_CAMERA.latitude).toBeGreaterThan(37.4);
    expect(PHONE_PORTRAIT_PENINSULA_CAMERA.latitude).toBeLessThan(37.65);
    expect(PHONE_PORTRAIT_PENINSULA_CAMERA.longitude).toBeLessThan(-122.3);
    expect(PHONE_PORTRAIT_PENINSULA_CAMERA.zoom).toBeGreaterThan(9.5);
  });
});
