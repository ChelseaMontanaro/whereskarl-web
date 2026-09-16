import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ConditionIcon } from '@/components/conditions/ConditionIcon';
import { FavoriteHeartButton } from '@/components/favorites/FavoriteHeartButton';
import { FavoritesConditionChip } from '@/components/favorites/FavoritesConditionChip';
import { FavoritesLocationThumb } from '@/components/favorites/FavoritesLocationThumb';
import {
  FAVORITES_GLASS_BORDER,
  FAVORITES_GLASS_FILL,
} from '@/components/favorites/favoritesChrome';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  getFogIntensityLabel,
  resolveLocationFogIntensity,
} from '@whereskarl/domain';
import { isNighttime } from '@/lib/home/weatherDisplay';
import { buildMapHref } from '@/lib/navigation';
import type { LocationWeather } from '@whereskarl/schemas';

type SavedLocationCardProps = {
  location: LocationWeather;
  onRemoveFavorite: (locationId: string) => void;
};

export function SavedLocationCard({
  location,
  onRemoveFavorite,
}: SavedLocationCardProps) {
  const isNightPresentation = isNighttime(new Date().getHours());
  const intensity = resolveLocationFogIntensity(location);
  const fogLevelLabel = getFogIntensityLabel(intensity);
  const statusLine = location.status.trim() || fogLevelLabel;
  const subtitle = location.distanceText
    ? `${statusLine} · ${location.distanceText}`
    : statusLine;

  const handlePress = () => {
    router.push(buildMapHref(location.id) as '/map');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${location.name}, ${statusLine}, ${Math.round(location.temperature)} degrees, ${fogLevelLabel}, ${Math.round(location.sunshineScore)} clear skies score`}
      accessibilityHint="Opens this location on the map"
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <FavoritesLocationThumb
        imageUrl={location.imageUrl}
        focalPoint={location.focalPoint}
        locationName={location.name}
        size={44}
      />

      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {location.name}
        </Text>
        <Text style={styles.status} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.tempRow}>
          <Text style={styles.temperature}>
            {Math.round(location.temperature)}°
          </Text>
          <ConditionIcon
            intensity={intensity}
            isNighttime={isNightPresentation}
            size={18}
          />
        </View>
        <FavoritesConditionChip location={location} />
      </View>

      <FavoriteHeartButton
        locationName={location.name}
        onRemove={() => onRemoveFavorite(location.id)}
        size="sm"
      />
      <Text style={styles.chevron} accessibilityElementsHidden>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FAVORITES_GLASS_BORDER,
    backgroundColor: FAVORITES_GLASS_FILL,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardPressed: {
    opacity: 0.9,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  status: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.68)',
  },
  metrics: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  temperature: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.35)',
    marginLeft: -2,
  },
});
