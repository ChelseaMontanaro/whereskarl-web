import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { KarlMapOverlayState } from '@/components/KarlMap/KarlMapOverlayState';
import type { KarlMapProps } from '@/components/KarlMap/KarlMap.types';
import { BAY_AREA_DEFAULT_BOUNDS } from '@/lib/map/mapConfig';
import {
  getMarkerAccessibilityLabel,
  getMarkerVisualState,
} from '@/lib/map/markerAppearance';
import { Colors } from '@/constants/theme';

function boundsToRegion(): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  const [[west, south], [east, north]] = BAY_AREA_DEFAULT_BOUNDS;

  return {
    latitude: (north + south) / 2,
    longitude: (east + west) / 2,
    latitudeDelta: north - south,
    longitudeDelta: east - west,
  };
}

function KarlMapMarker({
  location,
  isSelected,
  onSelect,
}: {
  location: KarlMapProps['locations'][number];
  isSelected: boolean;
  onSelect: (locationId: string) => void;
}) {
  const visual = getMarkerVisualState(location, isSelected);

  return (
    <Marker
      identifier={location.id}
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      onPress={() => onSelect(location.id)}
      accessibilityLabel={getMarkerAccessibilityLabel(location, isSelected)}
      tracksViewChanges={false}>
      <View
        style={[
          styles.markerOuter,
          {
            borderColor: visual.borderColor,
            transform: [{ scale: visual.scale }],
          },
          isSelected && styles.markerOuterSelected,
        ]}>
        <View
          style={[
            styles.markerInner,
            { backgroundColor: visual.fillColor },
            visual.intensity === 'karlTerritory' && styles.markerKarl,
          ]}
        />
      </View>
    </Marker>
  );
}

export default function KarlMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  isLoading = false,
  error = null,
  searchQuery = '',
}: KarlMapProps) {
  const mapRef = useRef<MapView>(null);
  const initialRegion = useMemo(() => boundsToRegion(), []);

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
        latitudeDelta: 0.35,
        longitudeDelta: 0.35,
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
        mapPadding={{ top: 12, right: 12, bottom: 12, left: 12 }}>
        {locations.map((location) => (
          <KarlMapMarker
            key={location.id}
            location={location}
            isSelected={selectedLocationId === location.id}
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
  markerOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3, 11, 20, 0.55)',
  },
  markerOuterSelected: {
    shadowColor: Colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  markerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  markerKarl: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
