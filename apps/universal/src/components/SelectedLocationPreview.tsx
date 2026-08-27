import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MapConditionIcon } from '@/components/KarlMap/KarlMapMarkerView';
import { ConditionIcon } from '@/components/conditions/ConditionIcon';
import { HomeLocationBadge } from '@/components/HomeLocationBadge';
import { LocationCircularImage } from '@/components/location/LocationCircularImage';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { LiquidGlassTokens } from '@/constants/liquidGlass';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { useIsNighttime } from '@/hooks/useIsNighttime';
import {
  formatTemperature,
  locationWeatherMetadataItems,
} from '@/lib/map/locationMetadata';
import {
  formatRelativeUpdatedAt,
  getKarlReadParagraph,
  getSelectedLocationHourlyPeriods,
  getSelectedLocationSubtitle,
} from '@/lib/map/mapPanelDisplay';
import {
  clearSkiesScoreColor,
  getFogIntensityLabel,
  getProductRegionNameForLocation,
  presentClearSkiesScore,
  resolveFogScore,
  resolveLocationFogIntensity,
} from '@whereskarl/domain';
import type { LocationWeather } from '@whereskarl/schemas';



type SelectedLocationPreviewProps = {
  location: LocationWeather | null;
  isSelected?: boolean;
  isHomeLocation?: boolean;
  onOpenDetail?: (locationId: string) => void;
  onDismiss?: () => void;
  variant?: 'card' | 'compact';
  /** Phone map sheet treatment aligned with mobile Web info hierarchy. */
  phonePortrait?: boolean;
};

const cardScoreGreen = '#22E36B';

export function SelectedLocationPreview({
  location,
  isSelected = true,
  isHomeLocation = false,
  onOpenDetail,
  onDismiss,
  variant = 'card',
  phonePortrait = false,
}: SelectedLocationPreviewProps) {
  const isNighttime = useIsNighttime();

  if (!location) {
    return null;
  }

  if (variant === 'compact' && phonePortrait) {
    return (
      <PhoneSelectedLocationSheet
        location={location}
        isHomeLocation={isHomeLocation}
        onDismiss={onDismiss}
        onOpenDetail={onOpenDetail}
        isNighttime={isNighttime}
      />
    );
  }

  const isCompact = variant === 'compact';
  const subtitle = getSelectedLocationSubtitle(location);
  const metadata = locationWeatherMetadataItems(location).join(' • ');
  const score = Math.round(location.sunshineScore);
  const scoreColor = isCompact
    ? clearSkiesScoreColor(location.sunshineScore)
    : cardScoreGreen;
  const conditionIntensity = isCompact
    ? resolveLocationFogIntensity(location)
    : null;

  const detailLink =
    !isCompact && onOpenDetail ? (
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
    ) : null;

  return (
    <PreviewContainer isCompact={isCompact} isSelected={isSelected}>
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
        {isCompact ? (
          <View style={styles.plainIconWrap}>
            <ConditionIcon
              intensity={conditionIntensity ?? 'clear'}
              isNighttime={isNighttime}
              size={28}
            />
          </View>
        ) : (
          <MapConditionIcon
            location={location}
            isSelected={isSelected}
            size={44}
          />
        )}

        <View style={[styles.contentBlock, isCompact && styles.contentBlockCompact]}>
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

        <View
          style={[styles.scoreBlock, isCompact && styles.scoreBlockCompact]}>
          <Text
            style={[
              styles.scoreEyebrow,
              !isCompact && styles.scoreEyebrowDesktop,
              isCompact && styles.scoreEyebrowCompact,
            ]}>
            Clear Skies Score
          </Text>
          <Text
            style={[
              styles.scoreValue,
              isCompact && styles.scoreValueCompact,
              { color: scoreColor },
            ]}>
            {score}
          </Text>
        </View>
      </View>

      {detailLink}
    </PreviewContainer>
  );
}

function PhoneSelectedLocationSheet({
  location,
  isHomeLocation,
  onDismiss,
  onOpenDetail,
  isNighttime,
}: {
  location: LocationWeather;
  isHomeLocation: boolean;
  onDismiss?: () => void;
  onOpenDetail?: (locationId: string) => void;
  isNighttime: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isFavorite, handleToggleFavorite } = useFavoriteToggle(location.id);
  const score = presentClearSkiesScore(location.sunshineScore);
  const fogScore = resolveFogScore(location);
  const fogLabel = getFogIntensityLabel(
    resolveLocationFogIntensity(location),
  );
  const temperature = formatTemperature(location);
  const windSpeed =
    typeof location.windSpeed === 'number' && Number.isFinite(location.windSpeed)
      ? `${Math.round(location.windSpeed)} mph`
      : null;
  const regionName = getProductRegionNameForLocation(location);
  const karlRead = getKarlReadParagraph(location);
  const hourly = getSelectedLocationHourlyPeriods(location, isNighttime);

  return (
    <LiquidGlassSurface variant="panel" style={styles.phoneSheet}>
      <View style={styles.phoneHeaderRow}>
        <LocationCircularImage
          imageUrl={location.imageUrl}
          focalPoint={location.focalPoint}
          alt={`${location.name} photo`}
          size={56}
        />

        <View style={styles.phoneHeaderCopy}>
          {isHomeLocation ? <HomeLocationBadge /> : null}
          <Text style={styles.phoneName} numberOfLines={1}>
            {location.name}
          </Text>
          <Text style={styles.phoneMeta} numberOfLines={1}>
            {[
              regionName ? `${regionName}, CA` : null,
              formatRelativeUpdatedAt(location.updatedAt ?? null),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isFavorite }}
          accessibilityLabel={
            isFavorite
              ? `Remove ${location.name} from favorites`
              : `Add ${location.name} to favorites`
          }
          onPress={handleToggleFavorite}
          style={({ pressed }) => [
            styles.phoneIconButton,
            pressed && styles.buttonPressed,
          ]}>
          <Text
            style={[
              styles.favoriteGlyph,
              isFavorite && styles.favoriteGlyphActive,
            ]}>
            ♥
          </Text>
        </Pressable>

        {onDismiss ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear selected location"
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.phoneIconButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.closeLabel}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <View
        style={styles.coreWeatherRow}
        accessibilityLabel="Core weather">
        <CoreWeatherCell
          title="Score"
          value={String(score.score)}
          valueColor={score.color}
          supporting={score.qualityLabel}
        />
        <CoreWeatherCell
          title="Fog"
          value={fogScore === null ? '—' : `${fogScore}%`}
          supporting={fogLabel}
        />
        <CoreWeatherCell
          title="Temp"
          value={temperature?.replace('°F', '°') ?? '—'}
        />
        <CoreWeatherCell
          title="Wind"
          value={windSpeed ?? '—'}
          supporting={location.windDirection?.trim() || undefined}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isExpanded ? 'Collapse location details' : 'Expand location details'
        }
        onPress={() => setIsExpanded((current) => !current)}
        style={({ pressed }) => [
          styles.expandToggle,
          pressed && styles.buttonPressed,
        ]}>
        <Text style={styles.expandToggleLabel}>
          {isExpanded ? 'Show less' : 'Karl’s Read & outlook'}
        </Text>
        <Text style={styles.expandChevron}>{isExpanded ? '⌃' : '⌄'}</Text>
      </Pressable>

      {isExpanded ? (
        <View style={styles.expandedBody}>
          <Text style={styles.sectionLabel}>Karl’s Read</Text>
          <Text style={styles.karlRead}>{karlRead}</Text>

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
            Hourly Outlook
          </Text>
          <View style={styles.hourlyRow}>
            {hourly.map((period) => (
              <View key={period.key} style={styles.hourlyCell}>
                <Text style={styles.hourlyLabel}>{period.label}</Text>
                <Text style={styles.hourlyCaption}>{period.caption}</Text>
              </View>
            ))}
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
      ) : null}
    </LiquidGlassSurface>
  );
}

function CoreWeatherCell({
  title,
  value,
  valueColor,
  supporting,
}: {
  title: string;
  value: string;
  valueColor?: string;
  supporting?: string;
}) {
  return (
    <View style={styles.coreCell}>
      <Text style={styles.coreTitle}>{title}</Text>
      <Text style={[styles.coreValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      {supporting ? (
        <Text style={styles.coreSupporting} numberOfLines={1}>
          {supporting}
        </Text>
      ) : null}
    </View>
  );
}

function PreviewContainer({
  children,
  isCompact,
  isSelected,
}: {
  children: ReactNode;
  isCompact: boolean;
  isSelected: boolean;
}) {
  const containerStyle = [
    styles.container,
    isSelected && styles.containerSelected,
    isCompact && styles.containerCompact,
    isCompact && isSelected && styles.containerCompactSelected,
  ];

  if (isCompact) {
    return (
      <LiquidGlassSurface variant="panel" style={containerStyle}>
        {children}
      </LiquidGlassSurface>
    );
  }

  return <View style={containerStyle}>{children}</View>;
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
    width: '100%',
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
    backgroundColor: LiquidGlassTokens.fill,
    borderColor: LiquidGlassTokens.border,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  containerCompactSelected: {
    borderColor: LiquidGlassTokens.borderHighlight,
  },
  phoneSheet: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(160, 185, 210, 0.24)',
    backgroundColor: 'rgba(6, 15, 27, 0.92)',
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  phoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  phoneName: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  phoneIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  favoriteGlyph: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.42)',
  },
  favoriteGlyphActive: {
    color: Colors.gold,
  },
  coreWeatherRow: {
    flexDirection: 'row',
    gap: 4,
  },
  coreCell: {
    flex: 1,
    minWidth: 0,
    gap: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 5,
    paddingVertical: 6,
  },
  coreTitle: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  coreValue: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  coreSupporting: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
  },
  expandToggleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gold,
  },
  expandChevron: {
    fontSize: 13,
    color: Colors.gold,
  },
  expandedBody: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  sectionLabelSpaced: {
    marginTop: 6,
  },
  karlRead: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.82)',
  },
  hourlyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hourlyCell: {
    gap: 2,
    minWidth: 72,
  },
  hourlyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  hourlyCaption: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    alignItems: 'center',
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  contentBlock: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  contentBlockCompact: {
    gap: 5,
    paddingTop: 1,
  },
  name: {
    fontFamily: Fonts?.serif,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  nameCompact: {
    fontFamily: Fonts?.sans,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  subtitleCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  metadata: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  metadataCompact: {
    marginTop: 0,
    fontSize: 11,
    lineHeight: 14,
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
    justifyContent: 'center',
    minWidth: 72,
    paddingLeft: Spacing.sm,
    gap: 2,
  },
  scoreEyebrow: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scoreEyebrowDesktop: {
    color: 'rgba(242, 163, 38, 0.9)',
  },
  scoreEyebrowCompact: {
    fontSize: 9,
    letterSpacing: 0.7,
    textAlign: 'center',
  },
  scoreValue: {
    marginTop: 2,
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 36,
    color: cardScoreGreen,
  },
  scoreValueCompact: {
    fontSize: 28,
    lineHeight: 30,
    marginTop: 0,
    fontWeight: '300',
    textAlign: 'center',
  },
  plainIconWrap: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
