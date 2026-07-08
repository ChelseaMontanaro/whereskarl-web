import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { KarlMapMarkerView } from '@/components/KarlMap/KarlMapMarkerView';
import { KarlMapOverlayState } from '@/components/KarlMap/KarlMapOverlayState';
import type { KarlMapProps } from '@/components/KarlMap/KarlMap.types';
import { Colors } from '@/constants/theme';
import { getMarkerAccessibilityLabel } from '@/lib/map/markerAppearance';
import {
  boundsToRegion,
  getMapBoundsForLayout,
} from '@/lib/map/mapConfig';

function KarlMapMarker({
  location,
  isSelected,
  layout,
  onSelect,
}: {
  location: KarlMapProps['locations'][number];
  isSelected: boolean;
  layout: KarlMapProps['layout'];
  onSelect: (locationId: string) => void;
}) {
  return (
    <Marker
      identifier={location.id}
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      onPress={() => onSelect(location.id)}
      accessibilityLabel={getMarkerAccessibilityLabel(location, isSelected)}
      anchor={{ x: 0.5, y: 0.92 }}
      tracksViewChanges={false}>
      <KarlMapMarkerView
        location={location}
        isSelected={isSelected}
        size={layout === 'mobile' ? 'compact' : 'regular'}
      />
    </Marker>
  );
}

export default function KarlMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  isLoading = false,
  error = null,
  layout = 'mobile',
  searchQuery = '',
}: KarlMapProps) {
  const mapRef = useRef<MapView>(null);
  const initialRegion = useMemo(
    () => boundsToRegion(getMapBoundsForLayout(layout ?? 'mobile')),
    [layout],
  );

  useEffect(() => {
    if (!selectedLocationId || !mapRef.current) {
      return;
    }

    const selected = locations.find((location) => location.id === selectedLocationId);
    if (!selected) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: selected.latitude,
        longitude: selected.longitude,
        latitudeDelta: 0.22,
        longitudeDelta: 0.22,
      },
      350,
    );
  }, [locations, selectedLocationId]);

  const overlayMessage = (() => {
    if (isLoading && locations.length === 0) {
      return 'Loading Bay Area locations…';
    }

    if (error && locations.length === 0) {
      return 'Live map data is unavailable right now. Check your API connection and try again.';
    }

    if (locations.length === 0 && searchQuery.trim()) {
      return `No locations match “${searchQuery.trim()}”.`;
    }

    if (locations.length === 0) {
      return 'No monitored locations are available to plot on the map.';
    }

    return null;
  })();

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType="mutedStandard"
        userInterfaceStyle="dark"
        showsCompass={false}
        showsBuildings={false}
        showsTraffic={false}
        mapPadding={{
          top: layout === 'mobile' ? 168 : 12,
          right: 12,
          bottom: layout === 'mobile' ? 120 : 12,
          left: 12,
        }}>
        {locations.map((location) => (
          <KarlMapMarker
            key={location.id}
            location={location}
            isSelected={selectedLocationId === location.id}
            layout={layout}
            onSelect={onSelectLocation}
          />
        ))}
      </MapView>

      {overlayMessage ? (
        <KarlMapOverlayState
          message={overlayMessage}
          isLoading={isLoading && locations.length === 0}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.navy,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});
