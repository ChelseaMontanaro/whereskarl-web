import type { FogIntensity } from '@/lib/map/locationsDisplay';
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
};

export type KarlMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
