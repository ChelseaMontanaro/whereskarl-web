import { describe, expect, it } from "vitest";

import { BAY_AREA_MAX_BOUNDS, type MapBounds } from "@/lib/map/config";
import {
  PHONE_PORTRAIT_ALL_BAY_BOUNDS,
  PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_PENINSULA_REGION_BOUNDS,
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
  berkeley: { lat: 37.8715, lng: -122.273 },
  oakland: { lat: 37.8044, lng: -122.2712 },
  alameda: { lat: 37.7651, lng: -122.2416 },
  hayward: { lat: 37.6688, lng: -122.0808 },
  paloAlto: { lat: 37.4419, lng: -122.143 },
  mountainView: { lat: 37.3861, lng: -122.0839 },
  sanJose: { lat: 37.3382, lng: -121.8863 },
  fosterCity: { lat: 37.5585, lng: -122.271 },
  fremont: { lat: 37.5485, lng: -121.9886 },
  livermore: { lat: 37.6819, lng: -121.768 },
  dalyCity: { lat: 37.6879, lng: -122.4702 },
  pacifica: { lat: 37.6138, lng: -122.4869 },
  halfMoonBay: { lat: 37.4636, lng: -122.4286 },
  sanMateo: { lat: 37.563, lng: -122.3255 },
  redwoodCity: { lat: 37.4858, lng: -122.228 },
} as const;

/**
 * The complete canonical supported catalog (backend `/locations` coordinates).
 * The all-Bay default camera must contain every entry — when the catalog
 * expands beyond `PHONE_PORTRAIT_ALL_BAY_BOUNDS`, update the bounds and this
 * list together.
 */
const FULL_CATALOG: Record<string, { lat: number; lng: number }> = {
  tiburon: { lat: 37.8735, lng: -122.4566 },
  sausalito: { lat: 37.8591, lng: -122.4853 },
  millValley: { lat: 37.906, lng: -122.5449 },
  stinsonBeach: { lat: 37.9005, lng: -122.6444 },
  marinHeadlands: { lat: 37.827, lng: -122.4995 },
  mountTamalpais: { lat: 37.9235, lng: -122.5965 },
  sanRafael: { lat: 37.9735, lng: -122.5311 },
  oceanBeach: { lat: 37.7594, lng: -122.5107 },
  sanFrancisco: { lat: 37.7749, lng: -122.4194 },
  presidio: { lat: 37.7989, lng: -122.4662 },
  goldenGatePark: { lat: 37.7694, lng: -122.4862 },
  bakerBeach: { lat: 37.79437, lng: -122.48331 },
  crissyField: { lat: 37.80403, lng: -122.46502 },
  twinPeaks: { lat: 37.75288, lng: -122.44756 },
  doloresPark: { lat: 37.7596, lng: -122.4269 },
  landsEnd: { lat: 37.788, lng: -122.5055 },
  richmondDistrict: { lat: 37.78, lng: -122.48 },
  dalyCity: { lat: 37.6879, lng: -122.4702 },
  pacifica: { lat: 37.6138, lng: -122.4869 },
  berkeley: { lat: 37.8715, lng: -122.273 },
  oakland: { lat: 37.8044, lng: -122.2712 },
  alameda: { lat: 37.7651, lng: -122.2416 },
  paloAlto: { lat: 37.4419, lng: -122.143 },
  redwoodCity: { lat: 37.4858, lng: -122.228 },
  sanMateo: { lat: 37.563, lng: -122.3255 },
  mountainView: { lat: 37.3861, lng: -122.0839 },
  sanJose: { lat: 37.3382, lng: -121.8863 },
  losGatos: { lat: 37.2266, lng: -121.9747 },
  halfMoonBay: { lat: 37.4636, lng: -122.4286 },
  hayward: { lat: 37.6688, lng: -122.0808 },
  cupertino: { lat: 37.323, lng: -122.0322 },
  southSanFrancisco: { lat: 37.6547, lng: -122.4077 },
  novato: { lat: 38.1074, lng: -122.5697 },
  fremont: { lat: 37.5485, lng: -121.9886 },
  santaRosa: { lat: 38.4404, lng: -122.7141 },
  petaluma: { lat: 38.2324, lng: -122.6367 },
  napa: { lat: 38.2975, lng: -122.2869 },
  fairfax: { lat: 37.9871, lng: -122.5889 },
  concord: { lat: 37.978, lng: -122.0311 },
  danville: { lat: 37.8216, lng: -122 },
  sanRamon: { lat: 37.7799, lng: -121.978 },
  livermore: { lat: 37.6819, lng: -121.768 },
};

function contains(bounds: MapBounds, point: { lat: number; lng: number }) {
  return isLocationWithinProductRegionBounds(point.lat, point.lng, bounds);
}

describe("phone-portrait all-Bay default camera geography", () => {
  it("contains every canonical supported catalog location", () => {
    for (const [id, point] of Object.entries(FULL_CATALOG)) {
      expect
        .soft(contains(PHONE_PORTRAIT_ALL_BAY_BOUNDS, point), id)
        .toBe(true);
    }
  });

  it("hugs the catalog extremes instead of over-zooming out", () => {
    const [[west, south], [east, north]] = PHONE_PORTRAIT_ALL_BAY_BOUNDS;

    // Santa Rosa (north + west), Los Gatos (south), Livermore (east) define
    // the catalog AABB; the bounds stay within ~0.01° of each extreme so the
    // frame stays focused on the Bay Area (padding provides breathing room).
    expect(north).toBeGreaterThanOrEqual(FULL_CATALOG.santaRosa.lat);
    expect(north).toBeLessThanOrEqual(FULL_CATALOG.santaRosa.lat + 0.01);
    expect(west).toBeLessThanOrEqual(FULL_CATALOG.santaRosa.lng);
    expect(west).toBeGreaterThanOrEqual(FULL_CATALOG.santaRosa.lng - 0.01);
    expect(south).toBeLessThanOrEqual(FULL_CATALOG.losGatos.lat);
    expect(south).toBeGreaterThanOrEqual(FULL_CATALOG.losGatos.lat - 0.01);
    expect(east).toBeGreaterThanOrEqual(FULL_CATALOG.livermore.lng);
    expect(east).toBeLessThanOrEqual(FULL_CATALOG.livermore.lng + 0.01);
  });

  it("stays inside the map's pan limits", () => {
    const [[west, south], [east, north]] = PHONE_PORTRAIT_ALL_BAY_BOUNDS;
    const [[maxWest, maxSouth], [maxEast, maxNorth]] = BAY_AREA_MAX_BOUNDS;

    expect(west).toBeGreaterThanOrEqual(maxWest);
    expect(south).toBeGreaterThanOrEqual(maxSouth);
    expect(east).toBeLessThanOrEqual(maxEast);
    expect(north).toBeLessThanOrEqual(maxNorth);
  });
});

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

  it("frames the East Bay on all five monitored catalog locations", () => {
    const bounds = PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS;
    const [[west, south], [east, north]] = bounds;

    // Full Phase 16.2E East Bay catalog must fit without zooming out.
    expect(contains(bounds, LOCATIONS.berkeley)).toBe(true);
    expect(contains(bounds, LOCATIONS.oakland)).toBe(true);
    expect(contains(bounds, LOCATIONS.alameda)).toBe(true);
    expect(contains(bounds, LOCATIONS.hayward)).toBe(true);
    expect(contains(bounds, LOCATIONS.fremont)).toBe(true);

    // Covers shoreline → South County corridor; does not sprawl into Tri-Valley
    // or San Jose.
    expect(west).toBeLessThanOrEqual(-122.3);
    expect(east).toBeGreaterThanOrEqual(-121.95);
    expect(south).toBeLessThanOrEqual(37.52);
    expect(north).toBeLessThanOrEqual(37.92);
    expect(contains(bounds, LOCATIONS.livermore)).toBe(false);
    expect(contains(bounds, LOCATIONS.sanJose)).toBe(false);
    expect(contains(bounds, LOCATIONS.sanFrancisco)).toBe(false);
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

  it("frames the Peninsula on all six monitored catalog locations", () => {
    const bounds = PHONE_PORTRAIT_PENINSULA_REGION_BOUNDS;
    const [[west, south], [east, north]] = bounds;

    // Full Phase 16.2A / 16.2D-1 Peninsula catalog must fit without zooming out.
    expect(contains(bounds, LOCATIONS.dalyCity)).toBe(true);
    expect(contains(bounds, LOCATIONS.pacifica)).toBe(true);
    expect(contains(bounds, LOCATIONS.halfMoonBay)).toBe(true);
    expect(contains(bounds, LOCATIONS.sanMateo)).toBe(true);
    expect(contains(bounds, LOCATIONS.redwoodCity)).toBe(true);
    expect(contains(bounds, LOCATIONS.paloAlto)).toBe(true);

    // Covers coast → bay corridor; does not drift into SF core or East Bay hills.
    expect(north).toBeLessThanOrEqual(37.78);
    expect(south).toBeLessThanOrEqual(37.3);
    expect(west).toBeLessThanOrEqual(-122.52);
    expect(east).toBeGreaterThanOrEqual(-122.0);
    expect(contains(bounds, LOCATIONS.sanFrancisco)).toBe(false);
    expect(contains(bounds, LOCATIONS.oakland)).toBe(false);
    expect(contains(bounds, LOCATIONS.sanJose)).toBe(false);
  });
});
