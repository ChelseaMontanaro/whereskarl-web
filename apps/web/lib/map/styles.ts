import type { StyleSpecification } from "maplibre-gl";

import { BAY_AREA_MAP_STYLE } from "@/lib/map/config";

export type KarlMapStyleId = "standard" | "satellite" | "hybrid";

export type KarlMapStyleOption = {
  id: KarlMapStyleId;
  label: string;
  /**
   * Static thumbnail of the actual Where's Karl map rendered in this style.
   * Every option is captured from `MAP_STYLE_PREVIEW_CAMERA`, so all previews
   * share identical framing and differ only by the underlying style. Regenerate
   * all three whenever the camera or a style changes (see the report below).
   */
  previewImage: string;
};

/**
 * Single canonical camera used to render every map-style preview thumbnail. A
 * representative central Bay Area framing (bay, peninsula, and East Bay all
 * visible). Change this in one place and regenerate all three previews so their
 * framing stays identical.
 */
export const MAP_STYLE_PREVIEW_CAMERA = {
  center: [-122.33, 37.66] as [number, number],
  zoom: 8.3,
  bearing: 0,
  pitch: 0,
} as const;

/** Matches iOS `KarlMapStyle` labels. */
export const KARL_MAP_STYLE_OPTIONS: KarlMapStyleOption[] = [
  {
    id: "standard",
    label: "Standard",
    previewImage: "/map-previews/standard.webp",
  },
  {
    id: "satellite",
    label: "Satellite",
    previewImage: "/map-previews/satellite.webp",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    previewImage: "/map-previews/hybrid.webp",
  },
];

const ESRI_SATELLITE_TILES = [
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
];

const ESRI_TRANSPORTATION_TILES = [
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
];

/** Dark-theme labels: near-white text with charcoal halo for satellite overlays. */
const CARTO_DARK_LABEL_TILES = [
  "https://basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}.png",
];

export const HYBRID_LABEL_TILESET = "dark_only_labels";

/** Muted tan/olive land, deep blue-green water, and cinematic contrast on satellite/hybrid. */
const cinematicSatellitePaint = {
  "raster-brightness-min": 0,
  "raster-brightness-max": 0.64,
  "raster-contrast": 0.38,
  "raster-saturation": -0.06,
  "raster-hue-rotate": 14,
} as const;

/**
 * Phone-portrait satellite: natural blue water and green land with only a
 * subtle cool polish — no brown cast, no heavy navy crush.
 */
const phonePortraitCinematicSatellitePaint = {
  "raster-brightness-min": 0,
  "raster-brightness-max": 0.78,
  "raster-contrast": 0.2,
  "raster-saturation": 0.06,
  "raster-hue-rotate": -5,
} as const;

/** Previous hybrid readability baseline for regression checks. */
export const HYBRID_LABEL_OPACITY_BASELINE = 0.84;
export const HYBRID_ROAD_OPACITY_BASELINE = 0.42;

/** Crisp near-white labels with a narrow dark charcoal halo over satellite imagery. */
export const hybridLabelPaint = {
  "raster-opacity": 1,
  "raster-brightness-min": 0,
  "raster-brightness-max": 1,
  "raster-contrast": 0.52,
  "raster-saturation": -0.88,
  "raster-hue-rotate": 0,
} as const;

/** Quiet secondary streets and connectors beneath major roads. */
export const hybridMinorRoadPaint = {
  "raster-opacity": 0.36,
  "raster-brightness-min": 0,
  "raster-brightness-max": 0.58,
  "raster-contrast": 0.08,
  "raster-saturation": -0.72,
  "raster-hue-rotate": 6,
} as const;

/** Major highways and arterials in muted warm off-white / gold. */
export const hybridMajorRoadPaint = {
  "raster-opacity": 0.78,
  "raster-brightness-min": 0.05,
  "raster-brightness-max": 0.9,
  "raster-contrast": 0.28,
  "raster-saturation": -0.38,
  "raster-hue-rotate": 18,
} as const;

const satelliteImagerySource = {
  type: "raster" as const,
  tiles: ESRI_SATELLITE_TILES,
  tileSize: 256,
  attribution:
    "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
};

const satelliteStyle = {
  version: 8,
  sources: {
    "karl-satellite": satelliteImagerySource,
  },
  layers: [
    {
      id: "karl-satellite",
      type: "raster",
      source: "karl-satellite",
      paint: cinematicSatellitePaint,
    },
  ],
} satisfies StyleSpecification;

const hybridStyle = {
  version: 8,
  sources: {
    "karl-satellite": satelliteImagerySource,
    "karl-roads": {
      type: "raster",
      tiles: ESRI_TRANSPORTATION_TILES,
      tileSize: 256,
      attribution: "Esri",
    },
    "karl-labels": {
      type: "raster",
      tiles: CARTO_DARK_LABEL_TILES,
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    {
      id: "karl-satellite",
      type: "raster",
      source: "karl-satellite",
      paint: cinematicSatellitePaint,
    },
    {
      id: "karl-roads-minor",
      type: "raster",
      source: "karl-roads",
      paint: hybridMinorRoadPaint,
    },
    {
      id: "karl-roads-major",
      type: "raster",
      source: "karl-roads",
      paint: hybridMajorRoadPaint,
    },
    {
      id: "karl-labels",
      type: "raster",
      source: "karl-labels",
      paint: hybridLabelPaint,
    },
  ],
} satisfies StyleSpecification;

const phonePortraitHybridStyle = {
  ...hybridStyle,
  layers: [
    {
      id: "karl-satellite",
      type: "raster",
      source: "karl-satellite",
      paint: phonePortraitCinematicSatellitePaint,
    },
    {
      id: "karl-roads-minor",
      type: "raster",
      source: "karl-roads",
      paint: {
        ...hybridMinorRoadPaint,
        "raster-opacity": 0.1,
      },
    },
    {
      id: "karl-roads-major",
      type: "raster",
      source: "karl-roads",
      paint: {
        ...hybridMajorRoadPaint,
        "raster-opacity": 0.3,
      },
    },
    {
      id: "karl-labels",
      type: "raster",
      source: "karl-labels",
      paint: {
        ...hybridLabelPaint,
        "raster-opacity": 0.42,
        "raster-contrast": 0.5,
      },
    },
  ],
} satisfies StyleSpecification;

const phonePortraitSatelliteStyle = {
  ...satelliteStyle,
  layers: [
    {
      id: "karl-satellite",
      type: "raster",
      source: "karl-satellite",
      paint: phonePortraitCinematicSatellitePaint,
    },
  ],
} satisfies StyleSpecification;

export function resolveKarlMapStyle(
  styleId: KarlMapStyleId,
  options?: { phonePortraitWeb?: boolean },
): string | StyleSpecification {
  const phonePortraitWeb = options?.phonePortraitWeb ?? false;

  switch (styleId) {
    case "standard":
      return BAY_AREA_MAP_STYLE;
    case "satellite":
      return phonePortraitWeb ? phonePortraitSatelliteStyle : satelliteStyle;
    case "hybrid":
      return phonePortraitWeb ? phonePortraitHybridStyle : hybridStyle;
  }
}

export function karlMapStyleHasLabelLayer(styleId: KarlMapStyleId): boolean {
  return styleId === "hybrid";
}

export function karlMapStyleHasRoadLayer(styleId: KarlMapStyleId): boolean {
  return styleId === "hybrid";
}

export function getKarlMapStyleLayerIds(styleId: KarlMapStyleId): string[] {
  const style = resolveKarlMapStyle(styleId);
  if (typeof style === "string") {
    return [];
  }

  return style.layers?.map((layer) => layer.id) ?? [];
}

export function getHybridLabelSourceTiles(): string[] {
  const style = resolveKarlMapStyle("hybrid");
  if (typeof style === "string") {
    return [];
  }

  const source = style.sources?.["karl-labels"];
  if (!source || source.type !== "raster") {
    return [];
  }

  return source.tiles ?? [];
}

export function getKarlMapStyleLayerPaint(
  styleId: KarlMapStyleId,
  layerId: string,
): Record<string, number> | undefined {
  const style = resolveKarlMapStyle(styleId);
  if (typeof style === "string") {
    return undefined;
  }

  const layer = style.layers?.find((entry) => entry.id === layerId);
  return layer?.paint as Record<string, number> | undefined;
}
