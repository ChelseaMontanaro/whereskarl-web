import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ConditionIcon } from '@/components/conditions/ConditionIcon';
import { FavoriteHeartButton } from '@/components/favorites/FavoriteHeartButton';
import { FavoritesConditionChip } from '@/components/favorites/FavoritesConditionChip';
import {
  FAVORITES_GLASS_BORDER,
  FAVORITES_GLASS_FILL,
} from '@/components/favorites/favoritesChrome';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { presentFavoritesDescriptiveStatus } from '@/lib/favorites/favoritesDisplay';
import { contentPositionFromFocalPoint } from '@/lib/location/locationCircularImage';
import {
  getLocationConditionLabel,
  resolveLocationFogIntensity,
} from '@whereskarl/domain';
import { isNighttime } from '@/lib/home/weatherDisplay';
import { buildMapHref } from '@/lib/navigation';
import type { LocationWeather } from '@whereskarl/schemas';

type TopSavedLocationCardProps = {
  location: LocationWeather;
  onRemoveFavorite: (locationId: string) => void;
};

export function TopSavedLocationCard({
  location,
  onRemoveFavorite,
}: TopSavedLocationCardProps) {
  const isNightPresentation = isNighttime(new Date().getHours());
  const intensity = resolveLocationFogIntensity(location);
  const statusLine =
    presentFavoritesDescriptiveStatus(location.status) ||
    getLocationConditionLabel(location, isNightPresentation);
  const imageUrl =
    typeof location.imageUrl === 'string' && location.imageUrl.trim().length > 0
      ? location.imageUrl.trim()
      : null;
  const [imageFailed, setImageFailed] = useState(false);
  const showLocationImage = Boolean(imageUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const handlePress = () => {
    router.push(buildMapHref(location.id) as '/map');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Top saved location, ${location.name}, ${statusLine}, ${Math.round(location.temperature)} degrees, clear skies score ${Math.round(location.sunshineScore)}`}
      accessibilityHint="Opens this location on the map"
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {showLocationImage ? (
        <>
          <Image
            source={{ uri: imageUrl! }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition={contentPositionFromFocalPoint(location.focalPoint)}
            onError={() => setImageFailed(true)}
          />
          <View pointerEvents="none" style={styles.imageScrim} />
        </>
      ) : null}

      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Top saved location</Text>
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            {location.name}
          </Text>
          <Text style={styles.status} numberOfLines={2}>
            {statusLine}
          </Text>
        </View>
        <View style={styles.heroMetrics}>
          <View style={styles.tempRow}>
            <Text style={styles.temperature}>
              {Math.round(location.temperature)}°
            </Text>
            <ConditionIcon
              intensity={intensity}
              isNighttime={isNightPresentation}
              size={22}
            />
          </View>
          <View style={styles.chipRow}>
            <FavoritesConditionChip location={location} />
            <FavoriteHeartButton
              locationName={location.name}
              onRemove={() => onRemoveFavorite(location.id)}
              size="sm"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FAVORITES_GLASS_BORDER,
    backgroundColor: FAVORITES_GLASS_FILL,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: 10,
  },
  cardPressed: {
    opacity: 0.92,
  },
  imageScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8, 20, 32, 0.42)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.sm,
  },
  badge: {
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.72)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  status: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.72)',
  },
  heroMetrics: {
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  temperature: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
