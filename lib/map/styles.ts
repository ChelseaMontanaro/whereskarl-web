import type { StyleSpecification } from "maplibre-gl";

import { BAY_AREA_MAP_STYLE } from "@/lib/map/config";

export type KarlMapStyleId = "standard" | "satellite" | "hybrid";

export type KarlMapStyleOption = {
  id: KarlMapStyleId;
  label: string;
};

/** Matches iOS `KarlMapStyle` labels. */
export const KARL_MAP_STYLE_OPTIONS: KarlMapStyleOption[] = [
  { id: "standard", label: "Standard" },
  { id: "satellite", label: "Satellite" },
  { id: "hybrid", label: "Hybrid" },
];

const ESRI_SATELLITE_TILES = [
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
];

const ESRI_TRANSPORTATION_TILES = [
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
];

/** Dark-theme label tiles for cinematic hybrid basemap. */
const CARTO_DARK_LABEL_TILES = [
  "https://basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}.png",
];

/** Muted tan/olive land, deep blue-green water, and cinematic contrast on satellite/hybrid. */
const cinematicSatellitePaint = {
  "raster-brightness-min": 0,
  "raster-brightness-max": 0.64,
  "raster-contrast": 0.38,
  "raster-saturation": -0.06,
  "raster-hue-rotate": 14,
} as const;

const hybridLabelPaint = {
  "raster-opacity": 0.84,
} as const;

const hybridRoadPaint = {
  "raster-opacity": 0.42,
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
      id: "karl-roads",
      type: "raster",
      source: "karl-roads",
      paint: hybridRoadPaint,
    },
    {
      id: "karl-labels",
      type: "raster",
      source: "karl-labels",
      paint: hybridLabelPaint,
    },
  ],
} satisfies StyleSpecification;

export function resolveKarlMapStyle(
  styleId: KarlMapStyleId,
): string | StyleSpecification {
  switch (styleId) {
    case "standard":
      return BAY_AREA_MAP_STYLE;
    case "satellite":
      return satelliteStyle;
    case "hybrid":
      return hybridStyle;
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
