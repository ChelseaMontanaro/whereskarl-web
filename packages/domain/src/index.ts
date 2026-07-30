/**
 * `@whereskarl/domain` — presentation rules for backend results shared across
 * TypeScript clients. Platform-agnostic; no transport, UI, search, or env.
 *
 * Does not reimplement backend environmental intelligence or canonical scoring.
 */

export {
  CLEAR_SKIES_SCORE_COLORS,
  CLEAR_SKIES_SCORE_GREEN_THRESHOLD,
  CLEAR_SKIES_SCORE_ORANGE_THRESHOLD,
  clampClearSkiesScore,
  clearSkiesScoreColor,
  clearSkiesScoreQualityLabel,
  presentClearSkiesScore,
  resolveClearSkiesScoreBand,
  type ClearSkiesScoreBand,
  type ClearSkiesScorePresentation,
} from "./clearSkiesScore";

export {
  AIR_QUALITY_COLOR_BY_TOKEN,
  AIR_QUALITY_COLORS,
  formatAirQualityCompact,
  presentAirQuality,
  type AirQuality,
  type AirQualityCategory,
  type AirQualityColorToken,
  type AirQualityPresentation,
} from "./airQuality";

export {
  UV_INDEX_COLOR_BY_TOKEN,
  UV_INDEX_COLORS,
  formatUvIndexCompact,
  presentUvIndex,
  type UltravioletIndex,
  type UltravioletIndexCategory,
  type UltravioletIndexColorToken,
  type UltravioletIndexPresentation,
} from "./uvIndex";

export {
  POLLEN_COLOR_BY_TOKEN,
  formatPollenCompact,
  presentPollen,
  type Pollen,
  type PollenCategory,
  type PollenColorToken,
  type PollenPresentation,
} from "./pollen";

export {
  HUMIDITY_CATEGORY_BY_BAND,
  formatHumidityPercent,
  humidityCategoryFromValue,
  presentHumidity,
  type HumidityCategory,
  type HumidityPresentation,
} from "./humidity";

export {
  VISIBILITY_CATEGORY_BY_BAND,
  formatVisibilityMiles,
  presentVisibility,
  visibilityCategoryFromValue,
  type VisibilityCategory,
  type VisibilityPresentation,
} from "./visibility";

export {
  CLIMATE_DESCRIPTOR,
  CLIMATE_ICON_COLOR,
  isClimate,
  presentClimate,
  type Climate,
  type ClimatePresentation,
} from "./climate";

export {
  AQI_COMPACT_TILE_LABEL_BY_CATEGORY,
  airQualityAccessibleLabel,
  compactAirQualityTileLabel,
} from "./environmentalDisplay";

export {
  DEGRADED_BEST_RIGHT_NOW_LABEL,
  DEGRADED_LOCATION_STATUS_LABEL,
  degradedMarkerAriaSuffix,
  isLocationDataDegraded,
} from "./dataStatus";

export {
  CLEAR_INTENSITY_SUNSHINE_THRESHOLD,
  CLEAR_SKIES_SCORE_THRESHOLD,
  getBestRightNowScoreLabel,
  getFogIntensity,
  getFogIntensityLabel,
  getLocationConditionLabel,
  getMarkerDisplayConditionLabel,
  locationMatchesFogIntensityFilter,
  locationQualifiesAsClearIntensity,
  resolveFogScore,
  resolveLocationFogIntensity,
  resolveMarkerDisplayIntensity,
  resolveRawLocationFogIntensity,
  type FogIntensity,
  type LocationConditionInput,
} from "./fog";

export {
  BAY_AREA_BACKEND_REGION_IDS,
  BAY_AREA_PRODUCT_REGIONS,
  BAY_AREA_VISIBLE_PRODUCT_REGION_IDS,
  filterLocationsByProductRegion,
  findBayAreaProductRegion,
  getProductRegionIdForLocation,
  getProductRegionNameForLocation,
  isBayAreaBackendRegionId,
  isBayAreaProductRegionId,
  isLocationWithinProductRegionBounds,
  locationMatchesProductRegion,
  normalizeVisibleMapRegionId,
  resolveBackendRegionId,
  resolveProductRegionId,
  type BayAreaBackendRegionId,
  type BayAreaProductRegion,
  type BayAreaProductRegionId,
  type BayAreaVisibleProductRegionId,
  type LocationWithCoordinates,
  type LocationWithOptionalCoordinates,
  type LocationWithRegion,
  type MapBounds,
} from "./regions";

export { formatConfidenceLabel } from "./confidence";
