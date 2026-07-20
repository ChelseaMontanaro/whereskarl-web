import { describe, expect, it } from "vitest";

import {
  BAY_AREA_MAX_BOUNDS,
  type MapBounds,
  type ViewportPadding,
} from "@/lib/map/config";
import {
  PHONE_PORTRAIT_ALL_BAY_BOUNDS,
  PHONE_PORTRAIT_ALL_BAY_VIEWPORT_PADDING,
  PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_EAST_BAY_VIEWPORT_PADDING,
  PHONE_PORTRAIT_MAP_MAX_ZOOM,
  PHONE_PORTRAIT_MAP_MIN_ZOOM,
  PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING,
  PHONE_PORTRAIT_PENINSULA_REGION_BOUNDS,
  PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING,
  PHONE_PORTRAIT_SF_REGION_BOUNDS,
  PHONE_PORTRAIT_SF_VIEWPORT_PADDING,
  PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_SOUTH_BAY_VIEWPORT_PADDING,
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

/**
 * Canonical geographic anchors — permanent physical landmarks that define
 * each region's product footprint independent of the current marker catalog.
 * A region camera must contain its anchors even where no marker exists today,
 * so that adding a location anywhere inside the footprint never requires a
 * camera retune. Coordinates are the landmarks themselves, not markers.
 */
const CANONICAL_ANCHORS = {
  sanFrancisco: {
    // Westernmost city land: Lands End / Ocean Beach.
    landsEndPoint: { lat: 37.7817, lng: -122.5115 },
    // South-west city corner: Lake Merced sits against the county line.
    lakeMerced: { lat: 37.728, lng: -122.494 },
    // South-east city corner on the bay — outside the pre-revision bounds.
    candlestickPoint: { lat: 37.7106, lng: -122.3866 },
    // Eastern city shoreline.
    huntersPoint: { lat: 37.7262, lng: -122.3735 },
    // Easternmost city land — outside the pre-revision bounds.
    treasureIsland: { lat: 37.8236, lng: -122.3705 },
    // Northern waterfront / islands.
    alcatraz: { lat: 37.8267, lng: -122.423 },
    fortPoint: { lat: 37.8107, lng: -122.477 },
    // Southern county line (San Mateo border) mid-span.
    countyLineSouth: { lat: 37.708, lng: -122.45 },
  },
  northBay: {
    // Westernmost North Bay land and the iconic Pacific fog landmark; a
    // future Point Reyes marker must not require a camera change.
    pointReyesLighthouse: { lat: 37.9962, lng: -123.0236 },
    pointReyesStation: { lat: 38.0697, lng: -122.8069 },
    // Sonoma coast north-west corner of the footprint.
    bodegaBay: { lat: 38.3332, lng: -123.0481 },
    // Northern extent: Russian River / Alexander Valley. Not a catalog
    // location today — a future Healdsburg marker must fit with no retune.
    healdsburg: { lat: 38.6102, lng: -122.8694 },
    // North-east Napa Valley extent. Not a catalog location today — a
    // future Calistoga marker must fit with no retune.
    calistoga: { lat: 38.5788, lng: -122.5797 },
    // Mid-valley Sonoma / Napa landmarks inside the same box.
    santaRosa: { lat: 38.4404, lng: -122.7141 },
    stHelena: { lat: 38.5052, lng: -122.4703 },
    // Eastern extent: the lower Napa Valley.
    napa: { lat: 38.2975, lng: -122.2869 },
    sonomaPlaza: { lat: 38.2919, lng: -122.458 },
    // Southern extent: the Golden Gate / Marin Headlands.
    marinHeadlands: { lat: 37.827, lng: -122.4995 },
  },
  eastBay: {
    // North-west shoreline corner (Richmond / San Pablo Bay).
    pointRichmond: { lat: 37.9235, lng: -122.3907 },
    // Northern extent: the Carquinez Strait shoreline.
    carquinezStrait: { lat: 38.0525, lng: -122.2231 },
    martinez: { lat: 38.0194, lng: -122.1341 },
    // Inland Contra Costa / Delta edge — beyond any current marker.
    antioch: { lat: 38.0049, lng: -121.8058 },
    brentwood: { lat: 37.9319, lng: -121.6958 },
    mountDiablo: { lat: 37.8816, lng: -121.9142 },
    // Eastern boundary of the East Bay: Altamont Pass.
    altamontPass: { lat: 37.7405, lng: -121.6555 },
    // Tri-Valley interior.
    pleasanton: { lat: 37.6624, lng: -121.8747 },
    // Southern ridge above Fremont.
    missionPeak: { lat: 37.5125, lng: -121.8802 },
  },
  southBay: {
    // Northern bay edge of the Santa Clara Valley.
    alvisoMarina: { lat: 37.4283, lng: -121.975 },
    milpitas: { lat: 37.4323, lng: -121.8996 },
    // Eastern foothills.
    alumRockPark: { lat: 37.3727, lng: -121.8163 },
    // Western foothill rim.
    saratoga: { lat: 37.2638, lng: -122.023 },
    // Sierra Azul southern ridge — well beyond the Los Gatos marker.
    mountUmunhum: { lat: 37.1601, lng: -121.8985 },
    newAlmaden: { lat: 37.1786, lng: -121.8226 },
    // Southern valley extent through Coyote Valley to Morgan Hill.
    coyoteValley: { lat: 37.19, lng: -121.74 },
    morganHill: { lat: 37.1305, lng: -121.6544 },
  },
  peninsula: {
    // Pacific coastside, north to south — mostly unmarked today.
    pointMontara: { lat: 37.5427, lng: -122.5137 },
    pillarPoint: { lat: 37.4959, lng: -122.4996 },
    sanGregorio: { lat: 37.3266, lng: -122.3861 },
    pescadero: { lat: 37.2552, lng: -122.3839 },
    pigeonPointLighthouse: { lat: 37.1817, lng: -122.3939 },
    // Southern coastal corner of San Mateo County.
    anoNuevo: { lat: 37.1086, lng: -122.308 },
    // Skyline ridge between coast and bay.
    sweeneyRidge: { lat: 37.6, lng: -122.47 },
    // Bayside corridor.
    sfo: { lat: 37.6213, lng: -122.379 },
    dumbartonWestShore: { lat: 37.49, lng: -122.12 },
  },
} as const;

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

describe("phone-portrait region camera geography (canonical footprints)", () => {
  it("frames San Francisco on the full city footprint, not today's markers", () => {
    const bounds = PHONE_PORTRAIT_SF_REGION_BOUNDS;
    const [[west, south], [east, north]] = bounds;

    // Canonical anchors: the four corners of the city landmass. Candlestick
    // Point and Treasure Island were outside the pre-revision, marker-fitted
    // bounds; a future marker anywhere in the city must fit with no retune.
    for (const [id, anchor] of Object.entries(CANONICAL_ANCHORS.sanFrancisco)) {
      expect.soft(contains(bounds, anchor), id).toBe(true);
    }

    // Catalog markers are contained but do not define the bounds.
    expect(contains(bounds, LOCATIONS.sanFrancisco)).toBe(true);
    expect(contains(bounds, LOCATIONS.oceanBeach)).toBe(true);
    expect(contains(bounds, FULL_CATALOG.twinPeaks)).toBe(true);
    expect(contains(bounds, FULL_CATALOG.crissyField)).toBe(true);

    // Thin southern-Marin context only — SF stays the subject.
    expect(contains(bounds, LOCATIONS.sausalito)).toBe(true);
    expect(contains(bounds, LOCATIONS.millValley)).toBe(false);
    expect(contains(bounds, LOCATIONS.sanRafael)).toBe(false);

    // Covers the county line without drifting into the Peninsula (Daly City).
    expect(south).toBeLessThanOrEqual(37.708);
    expect(contains(bounds, LOCATIONS.dalyCity)).toBe(false);
    expect(north).toBeLessThanOrEqual(37.9);
    expect(west).toBeLessThanOrEqual(-122.5145 + 0.01);
    expect(east).toBeGreaterThanOrEqual(-122.3705);
  });

  it("frames the North Bay on the canonical Marin–Sonoma–Napa footprint", () => {
    const bounds = PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS;
    const [[west, south], [, north]] = bounds;

    // Canonical anchors: Bodega Bay / Point Reyes Lighthouse (west),
    // Healdsburg (north), Calistoga / Napa (east), Marin Headlands (south).
    // Healdsburg and Calistoga have no markers today; they must fit with no
    // camera or pan-limit retune.
    for (const [id, anchor] of Object.entries(CANONICAL_ANCHORS.northBay)) {
      expect.soft(contains(bounds, anchor), id).toBe(true);
    }
    expect(contains(bounds, CANONICAL_ANCHORS.northBay.healdsburg)).toBe(true);
    expect(contains(bounds, CANONICAL_ANCHORS.northBay.calistoga)).toBe(true);

    // Every current North Bay catalog marker is contained (secondary check).
    for (const id of [
      "sausalito",
      "tiburon",
      "millValley",
      "stinsonBeach",
      "marinHeadlands",
      "mountTamalpais",
      "sanRafael",
      "fairfax",
      "novato",
      "petaluma",
      "santaRosa",
      "napa",
    ] as const) {
      expect.soft(contains(bounds, FULL_CATALOG[id]), id).toBe(true);
    }

    // The box necessarily spans San Pablo Bay (Berkeley's longitude sits
    // between Point Reyes and Napa) but must stop short of inland East Bay /
    // Tri-Valley and San Jose.
    expect(contains(bounds, FULL_CATALOG.concord)).toBe(false);
    expect(contains(bounds, LOCATIONS.livermore)).toBe(false);
    expect(contains(bounds, LOCATIONS.sanJose)).toBe(false);

    // West of the Point Reyes Lighthouse and Bodega Bay.
    expect(west).toBeLessThanOrEqual(-123.0481);
    // North of Healdsburg — the permanent northern anchor.
    expect(north).toBeGreaterThanOrEqual(38.6102);
    expect(south).toBeLessThanOrEqual(37.827);
  });

  it("frames the East Bay on the canonical shoreline-to-Altamont footprint", () => {
    const bounds = PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS;
    const [[west, south], [east, north]] = bounds;

    // Canonical anchors: Richmond shoreline → Carquinez Strait → Delta edge
    // (Antioch/Brentwood) → Altamont Pass → Mission Peak. Inland Contra Costa
    // and the Delta edge have no markers today; they must fit with no retune.
    for (const [id, anchor] of Object.entries(CANONICAL_ANCHORS.eastBay)) {
      expect.soft(contains(bounds, anchor), id).toBe(true);
    }

    // Every current East Bay catalog marker is contained (secondary check).
    for (const id of [
      "berkeley",
      "oakland",
      "alameda",
      "hayward",
      "fremont",
      "concord",
      "danville",
      "sanRamon",
      "livermore",
    ] as const) {
      expect.soft(contains(bounds, FULL_CATALOG[id]), id).toBe(true);
    }

    // Stops at the region's real edges: no San Jose, SF, or Vallejo (Solano).
    expect(contains(bounds, LOCATIONS.sanJose)).toBe(false);
    expect(contains(bounds, LOCATIONS.sanFrancisco)).toBe(false);
    expect(contains(bounds, { lat: 38.1042, lng: -122.2566 })).toBe(false); // Vallejo
    expect(west).toBeLessThanOrEqual(-122.3907);
    expect(east).toBeGreaterThanOrEqual(-121.6555);
    expect(north).toBeGreaterThanOrEqual(38.0525);
    expect(south).toBeLessThanOrEqual(37.5125);
  });

  it("frames the South Bay on the canonical Santa Clara Valley footprint", () => {
    const bounds = PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS;
    const [[west, south], [east, north]] = bounds;

    // Canonical anchors: valley rim-to-rim — Saratoga foothills, Alviso bay
    // edge, Alum Rock foothills, Sierra Azul ridge, Coyote Valley, Morgan
    // Hill. The valley south of Los Gatos has no markers today; it must fit
    // with no retune.
    for (const [id, anchor] of Object.entries(CANONICAL_ANCHORS.southBay)) {
      expect.soft(contains(bounds, anchor), id).toBe(true);
    }

    // Every current South Bay catalog marker is contained (secondary check).
    for (const id of [
      "mountainView",
      "sanJose",
      "cupertino",
      "losGatos",
    ] as const) {
      expect.soft(contains(bounds, FULL_CATALOG[id]), id).toBe(true);
    }

    // Does not creep north onto the mid-Peninsula / Foster City; Gilroy sits
    // beyond the supported valley footprint.
    expect(north).toBeLessThanOrEqual(37.5);
    expect(contains(bounds, LOCATIONS.fosterCity)).toBe(false);
    expect(contains(bounds, { lat: 37.0058, lng: -121.5683 })).toBe(false); // Gilroy
    expect(south).toBeLessThanOrEqual(37.1305);
    expect(west).toBeLessThanOrEqual(-122.023);
    expect(east).toBeGreaterThanOrEqual(-121.6544);
  });

  it("frames the Peninsula on the canonical Pacific-to-bay footprint", () => {
    const bounds = PHONE_PORTRAIT_PENINSULA_REGION_BOUNDS;
    const [[west, south], [east, north]] = bounds;

    // Canonical anchors: the full San Mateo peninsula — coastside from Point
    // Montara through Pescadero, Pigeon Point, and Año Nuevo (the county's
    // southern coastal corner), bayside from SFO through the Dumbarton shore.
    // The southern coastside has no markers today; it must fit with no retune.
    for (const [id, anchor] of Object.entries(CANONICAL_ANCHORS.peninsula)) {
      expect.soft(contains(bounds, anchor), id).toBe(true);
    }

    // Every current Peninsula catalog marker is contained (secondary check).
    for (const id of [
      "dalyCity",
      "southSanFrancisco",
      "pacifica",
      "sanMateo",
      "redwoodCity",
      "halfMoonBay",
      "paloAlto",
    ] as const) {
      expect.soft(contains(bounds, FULL_CATALOG[id]), id).toBe(true);
    }

    // Coast → bay; stops short of SF, the East Bay, and the South Bay
    // (Mountain View is the first South Bay marker east of the seam).
    expect(contains(bounds, LOCATIONS.sanFrancisco)).toBe(false);
    expect(contains(bounds, LOCATIONS.oakland)).toBe(false);
    expect(contains(bounds, LOCATIONS.mountainView)).toBe(false);
    expect(contains(bounds, LOCATIONS.sanJose)).toBe(false);
    expect(north).toBeLessThanOrEqual(37.71);
    expect(south).toBeLessThanOrEqual(37.1086);
    expect(west).toBeLessThanOrEqual(-122.5137);
    expect(east).toBeGreaterThanOrEqual(-122.12);
  });
});

/**
 * Phone-portrait camera physics: replicate MapLibre's fitBounds zoom math and
 * maxBounds center-constraint on the reference 390×844 viewport, then assert
 * the pan limits never clip a region's requested footprint off screen and
 * never force a zoom change (the actual distortion mode).
 */
describe("phone-portrait region cameras vs MapLibre pan limits", () => {
  const VIEWPORT_W = 390;
  const VIEWPORT_H = 844;
  const TILE_SIZE = 512;
  // Map chrome at 390×844: header + region chips end ~88px from the top; the
  // bottom tray / attribution zone begins ~614px. Markers must render between.
  const CHROME_TOP = 88;
  const CHROME_BOTTOM = 614;

  const mercX = (lng: number) => (180 + lng) / 360;
  const mercY = (lat: number) => {
    const sin = Math.sin((lat * Math.PI) / 180);
    return 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
  };

  function fitAndConstrain(bounds: MapBounds, rawPadding: ViewportPadding) {
    const padding =
      typeof rawPadding === "number"
        ? {
            top: rawPadding,
            right: rawPadding,
            bottom: rawPadding,
            left: rawPadding,
          }
        : {
            top: rawPadding.top ?? 0,
            right: rawPadding.right ?? 0,
            bottom: rawPadding.bottom ?? 0,
            left: rawPadding.left ?? 0,
          };
    const [[west, south], [east, north]] = bounds;
    const [[maxWest, maxSouth], [maxEast, maxNorth]] = BAY_AREA_MAX_BOUNDS;
    const contentW = VIEWPORT_W - padding.left - padding.right;
    const contentH = VIEWPORT_H - padding.top - padding.bottom;
    const spanX = mercX(east) - mercX(west);
    const spanY = mercY(south) - mercY(north);
    const zoom = Math.min(
      Math.log2(contentW / (TILE_SIZE * spanX)),
      Math.log2(contentH / (TILE_SIZE * spanY)),
      PHONE_PORTRAIT_MAP_MAX_ZOOM,
    );
    const worldPx = TILE_SIZE * 2 ** zoom;

    // fitBounds centers the bounds inside the padded content area; the
    // viewport center is offset from the content-area center by the padding
    // asymmetry.
    let centerX =
      (mercX(west) + mercX(east)) / 2 +
      (padding.right - padding.left) / 2 / worldPx;
    let centerY =
      (mercY(north) + mercY(south)) / 2 +
      (padding.bottom - padding.top) / 2 / worldPx;

    // MapLibre's maxBounds constraint clamps the center so the viewport stays
    // inside the pan limits.
    const halfW = VIEWPORT_W / 2 / worldPx;
    const halfH = VIEWPORT_H / 2 / worldPx;
    const minCenterX = mercX(maxWest) + halfW;
    const maxCenterX = mercX(maxEast) - halfW;
    const minCenterY = mercY(maxNorth) + halfH;
    const maxCenterY = mercY(maxSouth) - halfH;
    const requestedCenterX = centerX;
    const requestedCenterY = centerY;
    centerX =
      minCenterX > maxCenterX
        ? (minCenterX + maxCenterX) / 2
        : Math.min(Math.max(centerX, minCenterX), maxCenterX);
    centerY =
      minCenterY > maxCenterY
        ? (minCenterY + maxCenterY) / 2
        : Math.min(Math.max(centerY, minCenterY), maxCenterY);

    return {
      zoom,
      clampShiftXPx: (requestedCenterX - centerX) * worldPx,
      clampShiftYPx: (requestedCenterY - centerY) * worldPx,
      // True when the viewport at the fitted zoom fits inside the pan limits,
      // i.e. the constraint never has to force a different zoom (which would
      // distort the requested framing rather than just re-anchoring it).
      viewportFitsPanLimits:
        VIEWPORT_W / worldPx <= mercX(maxEast) - mercX(maxWest) &&
        VIEWPORT_H / worldPx <= mercY(maxSouth) - mercY(maxNorth),
      toScreen(point: { lat: number; lng: number }) {
        return {
          x: (mercX(point.lng) - centerX) * worldPx + VIEWPORT_W / 2,
          y: (mercY(point.lat) - centerY) * worldPx + VIEWPORT_H / 2,
        };
      },
    };
  }

  const allBay = fitAndConstrain(
    PHONE_PORTRAIT_ALL_BAY_BOUNDS,
    PHONE_PORTRAIT_ALL_BAY_VIEWPORT_PADDING,
  );

  it("shared pan limits cover the full product footprint including Healdsburg", () => {
    const [[west, south], [east, north]] = BAY_AREA_MAX_BOUNDS;

    // North clears Healdsburg / Calistoga; south is open enough for the
    // padded all-Bay zoom-out without center-clamping. Keep the box product-
    // sized — not an arbitrary statewide expand.
    expect(north).toBeGreaterThanOrEqual(39.05);
    expect(north).toBeLessThanOrEqual(39.15);
    expect(west).toBeLessThanOrEqual(-123.05); // Bodega / Point Reyes
    expect(east).toBeGreaterThanOrEqual(-121.62); // Altamont / Brentwood
    expect(south).toBeLessThanOrEqual(36.15); // padded all-Bay headroom
    expect(south).toBeGreaterThanOrEqual(36.0);

    for (const region of [
      PHONE_PORTRAIT_SF_REGION_BOUNDS,
      PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS,
      PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS,
      PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS,
      PHONE_PORTRAIT_PENINSULA_REGION_BOUNDS,
      PHONE_PORTRAIT_ALL_BAY_BOUNDS,
    ]) {
      const [[rWest, rSouth], [rEast, rNorth]] = region;
      expect(rWest).toBeGreaterThanOrEqual(west);
      expect(rSouth).toBeGreaterThanOrEqual(south);
      expect(rEast).toBeLessThanOrEqual(east);
      expect(rNorth).toBeLessThanOrEqual(north);
    }
  });

  it("all-Bay framing keeps catalog extremes inside comfortable padding", () => {
    // Side padding (~80px) is the binding fit; zoom settles just above the
    // phone-portrait minZoom floor so pinch-out cannot undo the breathing room.
    expect(allBay.zoom).toBeCloseTo(7.396, 2);
    expect(allBay.zoom).toBeGreaterThanOrEqual(PHONE_PORTRAIT_MAP_MIN_ZOOM);
    expect(allBay.viewportFitsPanLimits).toBe(true);
    expect(Math.abs(allBay.clampShiftYPx)).toBeLessThan(2);
    expect(Math.abs(allBay.clampShiftXPx)).toBeLessThan(2);

    const santaRosa = allBay.toScreen(FULL_CATALOG.santaRosa);
    const stinson = allBay.toScreen(FULL_CATALOG.stinsonBeach);
    const livermore = allBay.toScreen(FULL_CATALOG.livermore);
    const losGatos = allBay.toScreen(FULL_CATALOG.losGatos);

    expect(santaRosa.x).toBeCloseTo(81.4, 0);
    expect(santaRosa.y).toBeCloseTo(164.4, 0);
    expect(stinson.x).toBeCloseTo(98.1, 0);
    expect(stinson.y).toBeCloseTo(328.9, 0);
    expect(livermore.x).toBeCloseTo(308.1, 0);
    expect(livermore.y).toBeCloseTo(395.2, 0);
    expect(losGatos.x).toBeCloseTo(258.6, 0);
    expect(losGatos.y).toBeCloseTo(532.6, 0);

    // Breathing room: extremes stay well inside the screen / chrome, not
    // hugging the fog rail, right edge, chips, or bottom tray.
    expect(santaRosa.x).toBeGreaterThanOrEqual(72);
    expect(VIEWPORT_W - livermore.x).toBeGreaterThanOrEqual(72);
    expect(santaRosa.y).toBeGreaterThanOrEqual(CHROME_TOP + 48);
    expect(CHROME_BOTTOM - losGatos.y).toBeGreaterThanOrEqual(48);

    for (const [id, point] of Object.entries({
      santaRosa,
      stinson,
      livermore,
      losGatos,
    })) {
      expect.soft(point.y, `${id} y`).toBeGreaterThanOrEqual(CHROME_TOP);
      expect.soft(point.y, `${id} y`).toBeLessThanOrEqual(CHROME_BOTTOM);
      expect.soft(point.x, `${id} x`).toBeGreaterThanOrEqual(0);
      expect.soft(point.x, `${id} x`).toBeLessThanOrEqual(VIEWPORT_W);
    }
  });

  it("North Bay fitBounds is not center-clamped after the pan-limit raise", () => {
    const camera = fitAndConstrain(
      PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS,
      PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING,
    );
    expect(camera.viewportFitsPanLimits).toBe(true);
    expect(Math.abs(camera.clampShiftYPx)).toBeLessThan(2);
    expect(Math.abs(camera.clampShiftXPx)).toBeLessThan(2);

    const healdsburg = camera.toScreen(CANONICAL_ANCHORS.northBay.healdsburg);
    const calistoga = camera.toScreen(CANONICAL_ANCHORS.northBay.calistoga);
    expect(healdsburg.y).toBeGreaterThanOrEqual(CHROME_TOP);
    expect(calistoga.y).toBeGreaterThanOrEqual(CHROME_TOP);
    expect(healdsburg.x).toBeGreaterThanOrEqual(0);
    expect(calistoga.x).toBeLessThanOrEqual(VIEWPORT_W);
  });

  const REGION_CAMERAS = [
    {
      id: "san-francisco",
      bounds: PHONE_PORTRAIT_SF_REGION_BOUNDS,
      padding: PHONE_PORTRAIT_SF_VIEWPORT_PADDING,
      anchors: CANONICAL_ANCHORS.sanFrancisco,
    },
    {
      id: "north-bay",
      bounds: PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS,
      padding: PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING,
      anchors: CANONICAL_ANCHORS.northBay,
    },
    {
      id: "east-bay",
      bounds: PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS,
      padding: PHONE_PORTRAIT_EAST_BAY_VIEWPORT_PADDING,
      anchors: CANONICAL_ANCHORS.eastBay,
    },
    {
      id: "south-bay",
      bounds: PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS,
      padding: PHONE_PORTRAIT_SOUTH_BAY_VIEWPORT_PADDING,
      anchors: CANONICAL_ANCHORS.southBay,
    },
    {
      id: "peninsula",
      bounds: PHONE_PORTRAIT_PENINSULA_REGION_BOUNDS,
      padding: PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING,
      anchors: CANONICAL_ANCHORS.peninsula,
    },
  ] as const;

  it.each(REGION_CAMERAS)(
    "$id: pan limits never clip the canonical footprint",
    ({ bounds, padding, anchors }) => {
      const [[west, south], [east, north]] = bounds;
      const [[maxWest, maxSouth], [maxEast, maxNorth]] = BAY_AREA_MAX_BOUNDS;

      // Requested bounds sit inside the pan limits outright.
      expect(west).toBeGreaterThanOrEqual(maxWest);
      expect(south).toBeGreaterThanOrEqual(maxSouth);
      expect(east).toBeLessThanOrEqual(maxEast);
      expect(north).toBeLessThanOrEqual(maxNorth);

      const camera = fitAndConstrain(bounds, padding);

      // The constraint may re-anchor the camera but never forces a zoom
      // change, which is what would actually distort the requested frame.
      expect(camera.viewportFitsPanLimits).toBe(true);

      // Region cameras zoom in relative to the all-Bay default — no
      // excessive zoom-out.
      expect(camera.zoom).toBeGreaterThan(allBay.zoom);
      expect(camera.zoom).toBeLessThanOrEqual(PHONE_PORTRAIT_MAP_MAX_ZOOM);

      // After the maxBounds constraint, every canonical anchor still renders
      // inside the visible map chrome (below the header chips, above the
      // bottom tray, inside the side edges).
      for (const [id, anchor] of Object.entries(anchors)) {
        const { x, y } = camera.toScreen(anchor);
        expect.soft(x, `${id} x`).toBeGreaterThanOrEqual(0);
        expect.soft(x, `${id} x`).toBeLessThanOrEqual(VIEWPORT_W);
        expect.soft(y, `${id} y`).toBeGreaterThanOrEqual(CHROME_TOP);
        expect.soft(y, `${id} y`).toBeLessThanOrEqual(CHROME_BOTTOM);
      }
    },
  );
});
