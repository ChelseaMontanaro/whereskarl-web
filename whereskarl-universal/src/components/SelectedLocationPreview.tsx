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
  variant?: 'card' | 'sheet';
};

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

  const isSheet = variant === 'sheet';
  const subtitle = getSelectedLocationSubtitle(location);
  const metadata = locationWeatherMetadataItems(location).join(' • ');
  const score = Math.round(location.sunshineScore);
  const scoreColor = getScoreBadgeColor(score);

  return (
    <View
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        isSheet && styles.containerSheet,
        isSheet && isSelected && styles.containerSheetSelected,
      ]}>
      {isSheet ? <View style={styles.sheetHandle} accessibilityElementsHidden /> : null}

      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear selected location"
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.closeButton,
            isSheet && styles.closeButtonSheet,
            pressed && styles.buttonPressed,
          ]}>
          <Text style={styles.closeLabel}>×</Text>
        </Pressable>
      ) : null}

      <View style={styles.mainRow}>
        <MapConditionIcon
          location={location}
          isSelected={isSelected}
          size={isSheet ? 52 : 44}
        />

        <View style={styles.contentBlock}>
          {isHomeLocation ? <HomeLocationBadge /> : null}
          <Text style={[styles.name, isSheet && styles.nameSheet]}>
            {location.name}
          </Text>
          <Text
            style={[styles.subtitle, isSheet && styles.subtitleSheet]}
            numberOfLines={2}>
            {subtitle}
          </Text>
          {metadata ? (
            <Text
              style={[styles.metadata, isSheet && styles.metadataSheet]}
              numberOfLines={2}>
              {metadata}
            </Text>
          ) : null}
        </View>

        <View style={[styles.scoreBlock, isSheet && styles.scoreBlockSheet]}>
          <Text style={styles.scoreEyebrow}>Clear Skies Score</Text>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {score}
          </Text>
        </View>
      </View>

      {onOpenDetail ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open details for ${location.name}`}
          onPress={() => onOpenDetail(location.id)}
          style={({ pressed }) => [
            styles.detailLink,
            pressed && styles.buttonPressed,
          ]}>
          <Text style={styles.detailLinkLabel}>View details ›</Text>
        </Pressable>
      ) : null}
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
  containerSheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  containerSheetSelected: {
    backgroundColor: 'rgba(6, 18, 30, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(242, 163, 38, 0.18)',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    marginBottom: Spacing.xs,
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
  closeButtonSheet: {
    top: 14,
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
  nameSheet: {
    fontSize: 21,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  subtitleSheet: {
    fontSize: 13,
    lineHeight: 18,
  },
  metadata: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  metadataSheet: {
    fontSize: 12,
    lineHeight: 16,
  },
  scoreBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: Colors.glassBorder,
    minWidth: 76,
  },
  scoreBlockSheet: {
    minWidth: 82,
    paddingLeft: Spacing.md,
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
  detailLink: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  detailLinkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
