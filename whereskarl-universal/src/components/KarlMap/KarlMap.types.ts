import type { KarlMapMarkerLocation } from '@/lib/map/markerAppearance';

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
};

export type KarlMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
