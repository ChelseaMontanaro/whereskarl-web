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

const CARTO_LABEL_TILES = [
  "https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
];

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
  },
  layers: [
    {
      id: "karl-satellite",
      type: "raster",
      source: "karl-satellite",
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
      tiles: CARTO_LABEL_TILES,
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    {
      id: "karl-satellite",
      type: "raster",
      source: "karl-satellite",
    },
    {
      id: "karl-labels",
      type: "raster",
      source: "karl-labels",
      paint: {
        "raster-opacity": 0.92,
      },
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
