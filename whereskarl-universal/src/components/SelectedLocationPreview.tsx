import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MapConditionIcon } from '@/components/KarlMap/KarlMapMarkerView';
import { HomeLocationBadge } from '@/components/HomeLocationBadge';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { locationWeatherMetadataItems } from '@/lib/map/locationMetadata';
import { getSelectedLocationSubtitle } from '@/lib/map/mapPanelDisplay';
import { getScoreBadgeColor } from '@/lib/map/markerAppearance';
import type { LocationWeather } from '@/types/weather';

type SelectedLocationPreviewProps = {
  location: LocationWeather | null;
  isSelected?: boolean;
  isHomeLocation?: boolean;
  onOpenDetail?: (locationId: string) => void;
  onDismiss?: () => void;
  variant?: 'card' | 'compact';
};

const detailLinkBlue = 'rgba(96, 165, 250, 0.95)';

export function SelectedLocationPreview({
  location,
  isSelected = true,
  isHomeLocation = false,
  onOpenDetail,
  onDismiss,
  variant = 'card',
}: SelectedLocationPreviewProps) {
  if (!location) {
    return null;
  }

  const isCompact = variant === 'compact';
  const subtitle = getSelectedLocationSubtitle(location);
  const metadata = locationWeatherMetadataItems(location).join(' • ');
  const score = Math.round(location.sunshineScore);
  const scoreColor = getScoreBadgeColor(score);

  const detailLink = onOpenDetail ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open details for ${location.name}`}
      onPress={() => onOpenDetail(location.id)}
      style={({ pressed }) => [
        styles.detailLink,
        isCompact && styles.detailLinkCompact,
        pressed && styles.buttonPressed,
      ]}>
      <Text
        style={[
          styles.detailLinkLabel,
          isCompact && styles.detailLinkLabelCompact,
        ]}>
        View details ›
      </Text>
    </Pressable>
  ) : null;

  return (
    <View
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        isCompact && styles.containerCompact,
        isCompact && isSelected && styles.containerCompactSelected,
      ]}>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear selected location"
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.closeButton,
            isCompact && styles.closeButtonCompact,
            pressed && styles.buttonPressed,
          ]}>
          <Text style={styles.closeLabel}>×</Text>
        </Pressable>
      ) : null}

      <View style={[styles.mainRow, isCompact && styles.mainRowCompact]}>
        <MapConditionIcon
          location={location}
          isSelected={isSelected}
          size={isCompact ? 40 : 44}
        />

        <View style={styles.contentBlock}>
          {isHomeLocation ? <HomeLocationBadge /> : null}
          <Text style={[styles.name, isCompact && styles.nameCompact]}>
            {location.name}
          </Text>
          <Text
            style={[styles.subtitle, isCompact && styles.subtitleCompact]}
            numberOfLines={isCompact ? 1 : 2}>
            {subtitle}
          </Text>
          {metadata ? (
            <Text
              style={[styles.metadata, isCompact && styles.metadataCompact]}
              numberOfLines={isCompact ? 1 : 2}>
              {metadata}
            </Text>
          ) : null}
        </View>

        <View style={[styles.scoreBlock, isCompact && styles.scoreBlockCompact]}>
          <Text style={styles.scoreEyebrow}>Clear Skies Score</Text>
          <Text
            style={[
              styles.scoreValue,
              isCompact && styles.scoreValueCompact,
              { color: scoreColor },
            ]}>
            {score}
          </Text>
          {isCompact ? detailLink : null}
        </View>
      </View>

      {!isCompact ? detailLink : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(3, 11, 20, 0.94)',
    padding: Spacing.md,
    pointerEvents: 'auto',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 10,
  },
  containerSelected: {
    borderColor: 'rgba(242, 163, 38, 0.42)',
  },
  containerCompact: {
    borderRadius: Radius.lg,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: Spacing.sm,
    gap: 0,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  containerCompactSelected: {
    backgroundColor: 'rgba(6, 18, 30, 0.98)',
    borderColor: 'rgba(242, 163, 38, 0.42)',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 2,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  closeButtonCompact: {
    top: 6,
    right: 8,
    width: 32,
    height: 32,
  },
  closeLabel: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  mainRowCompact: {
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  contentBlock: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    fontFamily: Fonts?.serif,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  nameCompact: {
    fontSize: 17,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  subtitleCompact: {
    fontSize: 12,
    lineHeight: 15,
  },
  metadata: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  metadataCompact: {
    fontSize: 10,
    lineHeight: 13,
  },
  scoreBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: Colors.glassBorder,
    minWidth: 76,
  },
  scoreBlockCompact: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 72,
    paddingLeft: Spacing.sm,
    paddingTop: 2,
    gap: 1,
  },
  scoreEyebrow: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  scoreValue: {
    marginTop: 2,
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 32,
    color: Colors.gold,
  },
  scoreValueCompact: {
    fontSize: 26,
    lineHeight: 28,
    marginTop: 0,
  },
  detailLink: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  detailLinkCompact: {
    alignSelf: 'center',
    marginTop: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 32,
    justifyContent: 'center',
  },
  detailLinkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  detailLinkLabelCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: detailLinkBlue,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
