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

/** Dark-theme label tiles for cinematic satellite/hybrid basemaps. */
const CARTO_DARK_LABEL_TILES = [
  "https://basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}.png",
];

/** Pull imagery darker with stronger land/ocean contrast for the desktop map. */
const cinematicSatellitePaint = {
  "raster-brightness-min": 0,
  "raster-brightness-max": 0.62,
  "raster-contrast": 0.36,
  "raster-saturation": -0.12,
} as const;

const cinematicLabelPaint = {
  "raster-opacity": 0.84,
} as const;

const satelliteStyle = {
  version: 8,
  sources: {
    "karl-satellite": {
      type: "raster",
      tiles: ESRI_SATELLITE_TILES,
      tileSize: 256,
      attribution:
        "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
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
      id: "karl-labels",
      type: "raster",
      source: "karl-labels",
      paint: cinematicLabelPaint,
    },
  ],
} satisfies StyleSpecification;

const hybridStyle = {
  version: 8,
  sources: {
    "karl-satellite": {
      type: "raster",
      tiles: ESRI_SATELLITE_TILES,
      tileSize: 256,
      attribution:
        "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
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
      id: "karl-labels",
      type: "raster",
      source: "karl-labels",
      paint: cinematicLabelPaint,
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
  return styleId === "satellite" || styleId === "hybrid";
}
