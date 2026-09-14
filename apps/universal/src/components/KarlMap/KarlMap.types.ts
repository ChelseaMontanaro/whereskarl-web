import type { FogIntensity } from '@whereskarl/domain';
import type { KarlMapMarkerLocation } from '@/lib/map/markerAppearance';
import type { BayAreaVisibleProductRegionId } from '@/lib/map/regions';
import type { KarlMapStyleId } from '@/lib/map/styles';

export type KarlMapLayout = 'mobile' | 'desktop';

export type KarlMapProps = {
  locations: KarlMapMarkerLocation[];
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  layout?: KarlMapLayout;
  showLocationLabels?: boolean;
  searchQuery?: string;
  mapStyle?: KarlMapStyleId;
  fogLayerEnabled?: boolean;
  intensityFilter?: FogIntensity | null;
  isNighttime?: boolean;
  useConditionSvgIcons?: boolean;
  phonePortraitWeb?: boolean;
  /**
   * Phone-portrait only. When false (a region chip is active), skip the
   * all-Bay low-zoom label suppression so regional members stay eligible —
   * matching web's `applyLowZoomHiding = !selectedRegionId`.
   */
  applyLowZoomLabelHiding?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  onLocateMe?: () => void;
};

export type KarlMapHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  locateMe: () => void;
  fitToRegion: (regionId: BayAreaVisibleProductRegionId) => void;
  /**
   * Focus one location at canonical search zoom. Phone portrait moves the
   * camera on *search* selection only — marker taps and deep links never
   * reframe — so selection-source-aware callers drive this explicitly instead
   * of the map reacting to `selectedLocationId`.
   */
  focusLocation: (latitude: number, longitude: number) => void;
  /**
   * Frame the locations matching the active fog level, mirroring web's
   * intensity-filter fit. Returns false when nothing qualifies, so the caller
   * can fall through to the all-Bay frame exactly as web does.
   */
  fitToIntensityFilter: (intensity: FogIntensity) => boolean;
};

export type KarlMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
