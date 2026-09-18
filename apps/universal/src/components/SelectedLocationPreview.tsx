import { Image } from 'expo-image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapConditionIcon } from '@/components/KarlMap/KarlMapMarkerView';
import { KarlLogo } from '@/components/brand/KarlLogo';
import { ConditionIcon } from '@/components/conditions/ConditionIcon';
import { HomeLocationBadge } from '@/components/HomeLocationBadge';
import { LocationCircularImage } from '@/components/location/LocationCircularImage';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { Colors, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { LiquidGlassTokens } from '@/constants/liquidGlass';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { useIsNighttime } from '@/hooks/useIsNighttime';
import {
  ENV_METRIC_ICON_COLOR,
  ENV_METRIC_ICON_SIZE,
  ENV_METRIC_ICON_SLOT,
  getClimateMetricIconUri,
  getEnvironmentalMetricIconUri,
  type EnvironmentalMetricIconKind,
} from '@/lib/map/environmentalMetricIcons';
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
import { getPhonePortraitFogRailConditionIconDataUri } from '@/lib/map/phonePortraitConditionIcons';
import {
  PHONE_SHEET_LABEL_MAX_FONT_SCALE,
  PHONE_SHEET_SURFACE_TAP_ARM_DELAY_MS,
  resolvePhoneSheetExpandedMaxHeight,
} from '@/lib/map/phoneSelectedSheetLayout';
import {
  airQualityAccessibleLabel,
  clearSkiesScoreColor,
  compactAirQualityTileLabel,
  CLIMATE_ICON_COLOR,
  getFogIntensityLabel,
  getProductRegionNameForLocation,
  presentAirQuality,
  presentClearSkiesScore,
  presentClimate,
  presentHumidity,
  presentPollen,
  presentUvIndex,
  presentVisibility,
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
          hitSlop={12}
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

/**
 * Presentation-only soften for the AQI supporting colour (blends ~10% toward
 * white for a calmer moderate orange). Never changes canonical presenters.
 */
function softenAqiPresentationColor(
  color: string | undefined,
): string | undefined {
  if (!color || !/^#([0-9a-f]{6})$/i.test(color)) {
    return color;
  }

  const hex = color.slice(1);
  const mix = 0.1;
  const channel = (start: number) =>
    Math.round(start + (255 - start) * mix)
      .toString(16)
      .padStart(2, '0');

  return `#${channel(Number.parseInt(hex.slice(0, 2), 16))}${channel(
    Number.parseInt(hex.slice(2, 4), 16),
  )}${channel(Number.parseInt(hex.slice(4, 6), 16))}`;
}

const METRIC_VALUE_PLACEHOLDER = '—';

/**
 * Reserved height for the environmental-metric value row, shared by all six
 * cells so their supporting labels land on one baseline. Web reserves 1.625rem
 * for the same purpose (`ENV_METRIC_UNAVAILABLE_VALUE_CLASS`); native needs the
 * extra few points because RN clips glyphs to the line box rather than letting
 * them paint outside it as CSS `leading-none` does.
 */
const ENV_METRIC_VALUE_SLOT_HEIGHT = 30;

/**
 * Shared secondary-value sizing for Fog / Temp / Wind, responsive to the
 * *rendered string length only* — never to the underlying classification:
 *   "—" placeholder → 28 · ≤3 chars ("16%", "72°") → 23 · ≥4 ("WNW 13") → 19.
 * Clear Sky Score remains the sole hero at 38.
 */
function coreSecondaryValueStyle(formatted: string) {
  if (formatted === METRIC_VALUE_PLACEHOLDER) {
    return styles.coreValuePlaceholder;
  }

  return formatted.length >= 4
    ? styles.coreValueCompact
    : styles.coreValueRegular;
}

function PhoneSelectedLocationSheet({
  location,
  isHomeLocation,
  onDismiss,
  isNighttime,
}: {
  location: LocationWeather;
  isHomeLocation: boolean;
  onDismiss?: () => void;
  isNighttime: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedScrollRef = useRef<ScrollView>(null);
  // Web parity: after the card mounts (or switches location) briefly ignore
  // surface taps so the marker/search tap that opened it cannot fall through
  // and immediately expand it. The grab handle stays available throughout.
  const [surfaceExpandArmed, setSurfaceExpandArmed] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
    setSurfaceExpandArmed(false);
    const timer = setTimeout(() => {
      setSurfaceExpandArmed(true);
    }, PHONE_SHEET_SURFACE_TAP_ARM_DELAY_MS);

    return () => clearTimeout(timer);
  }, [location.id]);
  const { height: viewportHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isFavorite, handleToggleFavorite } = useFavoriteToggle(location.id);
  const score = presentClearSkiesScore(location.sunshineScore);
  const fogScore = resolveFogScore(location);
  const fogLabel = getFogIntensityLabel(
    resolveLocationFogIntensity(location),
  );
  const temperature = formatTemperature(location);
  const hasWindSpeed =
    typeof location.windSpeed === 'number' && Number.isFinite(location.windSpeed);
  const windDirection = location.windDirection?.trim();
  const windValue = hasWindSpeed
    ? windDirection
      ? `${windDirection} ${Math.round(location.windSpeed)}`
      : `${Math.round(location.windSpeed)}`
    : null;
  const regionName = getProductRegionNameForLocation(location);
  const karlRead = getKarlReadParagraph(location);
  const hourly = getSelectedLocationHourlyPeriods(location, isNighttime);

  const airQuality = presentAirQuality(location.airQuality);
  const ultraviolet = presentUvIndex(location.uvIndex);
  const pollen = presentPollen(location.pollen);
  const humidity = presentHumidity(location.humidity);
  const visibility = presentVisibility(location.visibility);
  const climate = presentClimate(location.climate);

  const expandedMaxHeight = resolvePhoneSheetExpandedMaxHeight(
    viewportHeight,
    insets.top,
    insets.bottom,
    PixelRatio.getFontScale(),
  );

  const environmentalMetrics: EnvironmentalMetricData[] = [
    {
      title: 'AQI',
      // Full canonical AQI copy for assistive tech; the tile shows the
      // shortened label so all six cells stay one line.
      accessibilityLabel: airQuality.available
        ? `AQI, ${airQualityAccessibleLabel(airQuality)}`
        : 'AQI, Unavailable',
      iconUri: getEnvironmentalMetricIconUri(
        'aqi',
        ENV_METRIC_ICON_COLOR.aqi,
      ),
      iconSize: ENV_METRIC_ICON_SIZE.aqi,
      value: airQuality.available ? String(airQuality.aqi) : 'Unavailable',
      supporting: airQuality.available
        ? compactAirQualityTileLabel(airQuality)
        : undefined,
      valueColor: airQuality.available
        ? (airQuality.color ?? undefined)
        : undefined,
      supportingColor: airQuality.available
        ? softenAqiPresentationColor(airQuality.color ?? undefined)
        : undefined,
    },
    {
      title: 'UV',
      accessibilityLabel: ultraviolet.available
        ? `UV, ${ultraviolet.value}, ${ultraviolet.label}`
        : 'UV, Unavailable',
      iconUri: getEnvironmentalMetricIconUri('uv', ENV_METRIC_ICON_COLOR.uv),
      iconSize: ENV_METRIC_ICON_SIZE.uv,
      value: ultraviolet.available ? String(ultraviolet.value) : 'Unavailable',
      supporting: ultraviolet.available ? ultraviolet.label : undefined,
      valueColor: ultraviolet.available
        ? (ultraviolet.color ?? undefined)
        : undefined,
      supportingColor: ultraviolet.available
        ? (ultraviolet.color ?? undefined)
        : undefined,
    },
    {
      title: 'Pollen',
      accessibilityLabel: pollen.available
        ? `Pollen, ${pollen.value}, ${pollen.label}`
        : 'Pollen, Unavailable',
      iconUri: getEnvironmentalMetricIconUri(
        'pollen',
        ENV_METRIC_ICON_COLOR.pollen,
      ),
      iconSize: ENV_METRIC_ICON_SIZE.pollen,
      value: pollen.available ? String(pollen.value) : 'Unavailable',
      supporting: pollen.available ? pollen.label : undefined,
      valueColor: pollen.available ? (pollen.color ?? undefined) : undefined,
      supportingColor: pollen.available ? (pollen.color ?? undefined) : undefined,
    },
    {
      title: 'Humidity',
      accessibilityLabel: humidity.available
        ? `Humidity, ${humidity.formatted}, ${humidity.label}`
        : 'Humidity, Unavailable',
      iconUri: getEnvironmentalMetricIconUri(
        'humidity',
        ENV_METRIC_ICON_COLOR.humidity,
      ),
      iconSize: ENV_METRIC_ICON_SIZE.humidity,
      value: humidity.available ? humidity.formatted : 'Unavailable',
      supporting: humidity.available ? humidity.label : undefined,
    },
    {
      title: 'Visibility',
      accessibilityLabel: visibility.available
        ? `Visibility, ${visibility.formatted}, ${visibility.label}`
        : 'Visibility, Unavailable',
      iconUri: getEnvironmentalMetricIconUri(
        'visibility',
        ENV_METRIC_ICON_COLOR.visibility,
      ),
      iconSize: ENV_METRIC_ICON_SIZE.visibility,
      value: visibility.available ? visibility.formatted : 'Unavailable',
      supporting: visibility.available ? visibility.label : undefined,
    },
    {
      title: 'Climate',
      accessibilityLabel: climate.available
        ? `Climate, ${climate.formatted}, ${climate.label}`
        : 'Climate, Unavailable',
      iconUri: getClimateMetricIconUri(
        climate.value ?? null,
        climate.available && climate.value
          ? CLIMATE_ICON_COLOR[climate.value]
          : ENV_METRIC_ICON_COLOR.climateUnavailable,
      ),
      iconSize: ENV_METRIC_ICON_SIZE.climate,
      value: climate.available ? climate.formatted : 'Unavailable',
      supporting: climate.available ? (climate.label ?? undefined) : undefined,
      supportingColor:
        climate.available && climate.value
          ? CLIMATE_ICON_COLOR[climate.value]
          : undefined,
      // Climate is a word-scale classification ("Fog Belt"), not a number.
      isWordScaleValue: climate.available,
    },
  ];

  function handleToggleExpanded() {
    setIsExpanded((current) => {
      const next = !current;
      if (next) {
        // Match web: expanding always starts at the top of the body so
        // Environmental Metrics is never scrolled out of view on open.
        expandedScrollRef.current?.scrollTo({ y: 0, animated: false });
      }
      return next;
    });
  }

  /**
   * Web parity (`expandOnSurfaceTap` in apps/web/components/ui/BottomSheet.tsx):
   * tapping the collapsed sheet body expands it, giving the whole peek a large
   * target. It only ever expands — the grab handle remains the collapse
   * affordance — and nested Pressables (favorite, close, handle) win the
   * responder before this fires, so they are never swallowed.
   */
  function handleSurfacePress() {
    if (isExpanded || !surfaceExpandArmed) {
      return;
    }

    handleToggleExpanded();
  }

  return (
    <LiquidGlassSurface variant="panel" style={styles.phoneSheet}>
      {/* Mobile-web parity: the expansion affordance is a grab handle above the
          header plus a collapsed surface tap, not a labelled row
          (apps/web/components/ui/BottomSheet.tsx). */}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={isExpanded ? 'Collapse details' : 'Expand details'}
        onPress={handleToggleExpanded}
        hitSlop={{ top: 8, bottom: 4, left: 0, right: 0 }}
        style={styles.sheetGrabHandleHitArea}>
        <View style={styles.sheetGrabHandle} />
      </Pressable>

      <Pressable
        // Not its own accessibility element: the grab handle is the announced
        // expand control and every child stays individually accessible.
        accessible={false}
        onPress={handleSurfacePress}
        style={styles.phoneSheetSurface}>
      <View style={styles.phoneHeaderRow}>
        <LocationCircularImage
          imageUrl={location.imageUrl}
          focalPoint={location.focalPoint}
          alt={`${location.name} photo`}
          size={64}
        />

        <View style={styles.phoneHeaderCopy}>
          {isHomeLocation ? <HomeLocationBadge /> : null}
          <Text
            style={styles.phoneName}
            numberOfLines={1}
            maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}>
            {location.name}
          </Text>
          <Text
            style={styles.phoneMeta}
            numberOfLines={1}
            maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}
            adjustsFontSizeToFit
            minimumFontScale={0.85}>
            {[
              regionName ? `${regionName}, CA` : null,
              formatRelativeUpdatedAt(location.updatedAt ?? null),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>

        <View style={styles.phoneHeaderActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isFavorite }}
            accessibilityLabel={
              isFavorite
                ? `Remove ${location.name} from favorites`
                : `Add ${location.name} to favorites`
            }
            hitSlop={8}
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
              testID="selected-location-dismiss"
              accessibilityRole="button"
              accessibilityLabel="Clear selected location"
              hitSlop={14}
              onPress={() => {
                onDismiss();
              }}
              style={({ pressed }) => [
                styles.phoneIconButton,
                styles.phoneDismissButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.closeLabel}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View
        style={styles.coreWeatherRow}
        accessibilityLabel="Core weather">
        <CoreWeatherCell
          title="CLEAR SKY SCORE"
          value={String(score.score)}
          valueColor={score.color}
          valueStyle={styles.coreValueHero}
          supporting={score.qualityLabel}
          supportingColor={score.color}
          supportingStyle={styles.coreSupportingHero}
          flex={2.2}
        />
        <CoreWeatherCell
          title="FOG"
          value={fogScore === null ? METRIC_VALUE_PLACEHOLDER : `${fogScore}%`}
          supporting={fogLabel}
          flex={1.25}
        />
        <CoreWeatherCell
          title="TEMP"
          value={temperature?.replace('°F', '°') ?? METRIC_VALUE_PLACEHOLDER}
          flex={1}
        />
        <CoreWeatherCell
          title="WIND"
          value={windValue ?? METRIC_VALUE_PLACEHOLDER}
          supporting={hasWindSpeed ? 'mph' : undefined}
          supportingLeadingGlyph={hasWindSpeed ? '→' : undefined}
          flex={1.25}
          showDivider={false}
        />
      </View>
      </Pressable>

      {isExpanded ? (
        <ScrollView
          ref={expandedScrollRef}
          style={[styles.expandedScroll, { maxHeight: expandedMaxHeight }]}
          contentContainerStyle={styles.expandedBody}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Environmental Metrics</Text>
          <View style={styles.envPanel} accessibilityLabel="Environmental metrics">
            <View style={styles.envGrid}>
              {/* Inset hairline dividers overlay the grid (web: inset-y-3 /
                  inset-x-3) so the six cells read as one surface. */}
              <View style={styles.envDividerLayer} pointerEvents="none">
                <View style={[styles.envDividerVertical, styles.envDividerFirst]} />
                <View style={[styles.envDividerVertical, styles.envDividerSecond]} />
                <View style={styles.envDividerHorizontal} />
              </View>
              <View style={styles.envRow}>
                {environmentalMetrics.slice(0, 3).map((metric) => (
                  <EnvironmentalMetricCell key={metric.title} metric={metric} />
                ))}
              </View>
              <View style={styles.envRow}>
                {environmentalMetrics.slice(3).map((metric) => (
                  <EnvironmentalMetricCell key={metric.title} metric={metric} />
                ))}
              </View>
            </View>
          </View>

          <View
            style={styles.marineRow}
            accessibilityLabel="Marine layer and fog ceiling">
            <ComingSoonMetric title="MARINE LAYER" iconKind="marineLayer" />
            <ComingSoonMetric title="FOG CEILING" iconKind="fogCeiling" />
          </View>

          <View style={styles.sectionBlock} accessibilityLabel="Karl’s Read">
            <Text style={styles.sectionLabel}>Karl’s Read</Text>
            <View style={styles.karlReadRow}>
              <KarlLogo size={56} />
              <Text
                style={styles.karlRead}
                maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}>
                {karlRead}
              </Text>
            </View>
          </View>

          <View style={styles.sectionBlock} accessibilityLabel="Hourly outlook">
            <Text style={[styles.sectionLabel, styles.sectionLabelWhite]}>
              Hourly Outlook
            </Text>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyRow}>
              {hourly.map((period) => (
                <View key={period.key} style={styles.hourlyCell}>
                  <Text style={styles.hourlyLabel}>{period.label}</Text>
                  <Image
                    source={{
                      uri: getPhonePortraitFogRailConditionIconDataUri(
                        period.intensity,
                        { isNighttime },
                      ),
                    }}
                    style={styles.hourlyIcon}
                    contentFit="contain"
                    accessibilityElementsHidden
                  />
                  <Text style={styles.hourlyCaption}>
                    {period.tempF !== null
                      ? `${period.tempF}°`
                      : period.caption}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      ) : null}
    </LiquidGlassSurface>
  );
}

type EnvironmentalMetricData = {
  title: string;
  accessibilityLabel: string;
  iconUri: string;
  iconSize: number;
  value: string;
  supporting?: string;
  valueColor?: string;
  supportingColor?: string;
  /** Word-scale classification (Climate) rather than a numeric reading. */
  isWordScaleValue?: boolean;
};

/**
 * One Environmental Metrics cell inside the shared panel.
 * Hierarchy: TITLE → icon → primary value → compact supporting label.
 */
function EnvironmentalMetricCell({
  metric,
}: {
  metric: EnvironmentalMetricData;
}) {
  const unavailable = metric.value === 'Unavailable';

  return (
    <View style={styles.envCell} accessibilityLabel={metric.accessibilityLabel}>
      <Text
        style={styles.envTitle}
        numberOfLines={1}
        maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}>
        {metric.title}
      </Text>
      <View style={styles.envIconValue}>
        <View style={styles.envIconSlot}>
          <Image
            source={{ uri: metric.iconUri }}
            style={{ width: metric.iconSize, height: metric.iconSize }}
            contentFit="contain"
            accessibilityElementsHidden
          />
        </View>
        {/* One reserved value height for all six cells: numeric (26), compact
            (20), word-scale (15) and unavailable (14) values centre inside it,
            so a single supporting `marginTop` puts every cell's status label on
            the same baseline without per-metric offsets. */}
        <View style={styles.envValueSlot}>
          <Text
            style={[
              unavailable
                ? styles.envValueUnavailable
                : metric.isWordScaleValue
                  ? styles.envValueWordScale
                  : metric.value.length >= 5
                    ? styles.envValueCompact
                    : styles.envValue,
              !unavailable && metric.valueColor
                ? { color: metric.valueColor }
                : null,
            ]}
            numberOfLines={1}
            maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}
            adjustsFontSizeToFit
            minimumFontScale={0.8}>
            {metric.value}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.envSupporting,
          !unavailable && metric.supportingColor
            ? { color: metric.supportingColor }
            : null,
        ]}
        numberOfLines={1}
        maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}>
        {metric.supporting ?? '\u00A0'}
      </Text>
    </View>
  );
}

/**
 * Marine Layer / Fog Ceiling placeholder. Approved horizontal composition:
 * icon left and vertically centred, title + "Coming Soon" stacked left.
 */
function ComingSoonMetric({
  title,
  iconKind,
}: {
  title: string;
  iconKind: EnvironmentalMetricIconKind;
}) {
  return (
    <View
      style={styles.comingSoonCard}
      accessibilityLabel={`${title} height, Coming Soon`}>
      <Image
        source={{
          uri: getEnvironmentalMetricIconUri(
            iconKind,
            ENV_METRIC_ICON_COLOR.marine,
          ),
        }}
        style={styles.comingSoonIcon}
        contentFit="contain"
        accessibilityElementsHidden
      />
      <View style={styles.comingSoonCopy}>
        <Text
          style={styles.comingSoonTitle}
          numberOfLines={1}
          maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}
          adjustsFontSizeToFit
          minimumFontScale={0.85}>
          {title}
        </Text>
        <Text style={styles.comingSoonValue}>Coming Soon</Text>
      </View>
    </View>
  );
}

function CoreWeatherCell({
  title,
  value,
  valueColor,
  valueStyle,
  supporting,
  supportingColor,
  supportingStyle,
  supportingLeadingGlyph,
  flex = 1,
  showDivider = true,
}: {
  title: string;
  value: string;
  valueColor?: string;
  valueStyle?: StyleProp<TextStyle>;
  supporting?: string;
  supportingColor?: string;
  supportingStyle?: StyleProp<TextStyle>;
  /** Gold directional glyph rendered before the supporting copy (Wind). */
  supportingLeadingGlyph?: string;
  flex?: number;
  showDivider?: boolean;
}) {
  return (
    <View
      style={[
        styles.coreCell,
        { flex },
        showDivider ? styles.coreCellDivider : null,
      ]}>
      {/* Web MetricColumn: h-5 title row, h-11 value row, mt-auto supporting
          row — every column shares the same three baselines. */}
      <View style={styles.coreTitleRow}>
        <Text
          style={styles.coreTitle}
          numberOfLines={1}
          maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}
          adjustsFontSizeToFit
          minimumFontScale={0.85}>
          {title}
        </Text>
      </View>
      <View style={styles.coreValueRow}>
        {/* adjustsFontSizeToFit is load-bearing: it is what keeps "WNW 13" and
            a three-digit Temp inside the ~53pt Fog/Wind columns at 320pt. It
            must never be paired with a hard row height — see coreValueRow. */}
        <Text
          style={[
            valueStyle ?? coreSecondaryValueStyle(value),
            valueColor ? { color: valueColor } : null,
          ]}
          numberOfLines={1}
          maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}
          adjustsFontSizeToFit
          minimumFontScale={0.8}>
          {value}
        </Text>
      </View>
      <View style={styles.coreSupportingRow}>
        {supportingLeadingGlyph ? (
          <Text style={styles.coreSupportingGlyph} numberOfLines={1}>
            {supportingLeadingGlyph}
          </Text>
        ) : null}
        <Text
          style={[
            supportingStyle ?? styles.coreSupporting,
            supportingColor ? { color: supportingColor } : null,
          ]}
          numberOfLines={1}
          maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}
          adjustsFontSizeToFit
          minimumFontScale={0.85}>
          {supporting ?? '\u00A0'}
        </Text>
      </View>
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
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    borderRadius: 18,
    borderWidth: 1,
    // Shared glass tokens, matching `containerCompact` above and the bottom nav.
    // The previous local 0.92 fill overrode the LiquidGlassSurface panel fill,
    // which suppressed the blur and left the card an opaque black rectangle.
    borderColor: LiquidGlassTokens.border,
    backgroundColor: LiquidGlassTokens.fill,
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 12,
    gap: 8,
    // The sheet sits inside a `box-none` overlay above the map; claim touches
    // explicitly so dismiss / favourite / expanded scrolling stay reliable.
    pointerEvents: 'auto',
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
    zIndex: 2,
  },
  phoneHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  phoneHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    zIndex: 3,
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    zIndex: 4,
  },
  phoneDismissButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    alignItems: 'stretch',
    gap: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  coreCell: {
    minWidth: 0,
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 4,
  },
  coreCellDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  coreTitleRow: {
    height: 20,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  coreTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    lineHeight: 13,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  coreValueRow: {
    // Web `h-11`. Reserved as a minimum, not a cap: every value line box is
    // <= 42 so all four columns still resolve to exactly 44 and share one
    // baseline, but no glyph run is ever clipped against a hard height.
    minHeight: 44,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  /* Card-wide rule: lineHeight must stay above fontSize and at or below the
     row it sits in. RN clips glyphs to the line box, so web's `leading-none`
     cannot be transcribed literally. */
  /** Clear Sky Score — the sole hero value in the strip. */
  coreValueHero: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  /** Secondary values sized by rendered string length (see helper). */
  coreValueRegular: {
    fontSize: 23,
    lineHeight: 26,
    fontWeight: '300',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  coreValueCompact: {
    fontSize: 19,
    lineHeight: 22,
    fontWeight: '300',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  coreValuePlaceholder: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  coreSupportingRow: {
    marginTop: 'auto',
    minHeight: 15,
    paddingTop: 4,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  coreSupporting: {
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '400',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  /** Score quality label — semibold and tinted to the score's own colour. */
  coreSupportingHero: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  coreSupportingGlyph: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    color: '#F5B000',
  },
  // Mirrors the approved web grab handle: 36×4 pill at white/30, centred above
  // the header (apps/web/components/ui/BottomSheet.tsx). Full-width row plus
  // hitSlop gives the 4pt pill a comfortable native touch target.
  sheetGrabHandleHitArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    // Web handle button is `pt-2.5 pb-1.5` around a 4px pill. In-flow padding
    // (not hitSlop alone) is required because GlassView clips overflow, which
    // makes hitSlop miss on physical iPhone.
    paddingTop: 10,
    paddingBottom: 6,
  },
  /** Collapsed-peek surface tap target (web `expandOnSurfaceTap`). */
  phoneSheetSurface: {
    width: '100%',
    gap: 8,
  },
  sheetGrabHandle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  expandedScroll: {
    // maxHeight is applied inline from viewport height + safe-area insets.
    width: '100%',
  },
  expandedBody: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(242, 163, 38, 0.9)',
  },
  /** Hourly Outlook is the one section that uses the white label variant. */
  sectionLabelWhite: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sectionBlock: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  envPanel: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  envGrid: {
    position: 'relative',
  },
  envDividerLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  envDividerVertical: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  envDividerFirst: {
    left: '33.3333%',
  },
  envDividerSecond: {
    left: '66.6666%',
  },
  envDividerHorizontal: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  envRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    zIndex: 1,
  },
  envCell: {
    flex: 1,
    minWidth: 0,
    minHeight: 102,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  envIconValue: {
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  envIconSlot: {
    width: ENV_METRIC_ICON_SLOT,
    height: ENV_METRIC_ICON_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.72,
    lineHeight: 14,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.78)',
    textAlign: 'center',
  },
  /**
   * The one reserved value height for all six environmental cells. Sized to the
   * tallest line box in the grid (the 26pt numeric value at lineHeight 30) so
   * shorter value treatments centre inside it rather than shortening the cell.
   */
  envValueSlot: {
    // Reserved, not capped — same contract as the core value row. All four
    // value treatments have line boxes <= this height, so every cell resolves
    // to the identical slot height and the supporting labels share a baseline.
    minHeight: ENV_METRIC_VALUE_SLOT_HEIGHT,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  envValue: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '300',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  envValueCompact: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '300',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  /** Climate classifications are words, not numbers. */
  envValueWordScale: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  envValueUnavailable: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
  },
  envSupporting: {
    marginTop: 8,
    minHeight: 15,
    width: '100%',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
  },
  marineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  comingSoonCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 82,
    maxHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    backgroundColor: 'rgba(255, 255, 255, 0.125)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  comingSoonIcon: {
    width: ENV_METRIC_ICON_SIZE.marine,
    height: ENV_METRIC_ICON_SIZE.marine,
  },
  comingSoonCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
    alignItems: 'flex-start',
  },
  comingSoonTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.72,
    lineHeight: 14,
    color: 'rgba(255, 255, 255, 0.78)',
    textAlign: 'left',
  },
  comingSoonValue: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  karlReadRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  karlRead: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  hourlyRow: {
    flexDirection: 'row',
    gap: 20,
    paddingBottom: 4,
  },
  hourlyCell: {
    minWidth: 48,
    gap: 6,
    alignItems: 'center',
  },
  hourlyLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.55)',
  },
  hourlyIcon: {
    width: 28,
    height: 28,
  },
  hourlyCaption: {
    fontSize: 14,
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
    color: 'rgba(255, 255, 255, 0.55)',
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
