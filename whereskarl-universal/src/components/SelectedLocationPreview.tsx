import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeLocationBadge } from '@/components/HomeLocationBadge';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { locationWeatherMetadataItems } from '@/lib/map/locationMetadata';
import { getSelectedLocationSubtitle } from '@/lib/map/mapPanelDisplay';
import { getMarkerVisualState } from '@/lib/map/markerAppearance';
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
  const markerVisual = getMarkerVisualState(location, isSelected);
  const subtitle = getSelectedLocationSubtitle(location);
  const metadata = locationWeatherMetadataItems(location).join(' • ');
  const score = Math.round(location.sunshineScore);

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
            pressed && styles.buttonPressed,
          ]}>
          <Text style={styles.closeLabel}>×</Text>
        </Pressable>
      ) : null}

      <View style={styles.mainRow}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: `${markerVisual.fillColor}22` },
          ]}>
          <View
            style={[
              styles.iconDot,
              {
                backgroundColor: markerVisual.fillColor,
                borderColor: markerVisual.borderColor,
              },
            ]}
          />
        </View>

        <View style={styles.contentBlock}>
          {isHomeLocation ? <HomeLocationBadge /> : null}
          <Text style={styles.name}>{location.name}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
          {metadata ? (
            <Text style={styles.metadata} numberOfLines={2}>
              {metadata}
            </Text>
          ) : null}
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreEyebrow}>Clear Skies Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
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
    backgroundColor: 'rgba(3, 11, 20, 0.92)',
    padding: Spacing.md,
    pointerEvents: 'auto',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  containerSelected: {
    borderColor: 'rgba(242, 163, 38, 0.35)',
  },
  containerSheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: Radius.lg + 4,
    borderTopRightRadius: Radius.lg + 4,
    paddingTop: Spacing.sm,
  },
  containerSheetSelected: {
    backgroundColor: 'rgba(9, 22, 34, 0.98)',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: Spacing.xs,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  closeLabel: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    width: 18,
    height: 18,
    borderRadius: Radius.pill,
    borderWidth: 2,
  },
  contentBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontFamily: Fonts?.serif,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  metadata: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  scoreBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: Colors.glassBorder,
    minWidth: 72,
  },
  scoreEyebrow: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  scoreValue: {
    marginTop: 2,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
    color: Colors.gold,
  },
  detailLink: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  detailLinkLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
