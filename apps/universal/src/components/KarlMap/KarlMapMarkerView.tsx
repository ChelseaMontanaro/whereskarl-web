import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { KarlLogo } from '@/components/brand/KarlLogo';
import { ConditionIcon } from '@/components/conditions/ConditionIcon';
import { Colors } from '@/constants/theme';
import {
  getMarkerVisualState,
  getPhonePortraitMarkerScoreValue,
  getScoreBadgeColor,
  type KarlMapMarkerLocation,
} from '@/lib/map/markerAppearance';
import { getMarkerConditionSymbol } from '@/lib/map/markerIcons';
import {
  PHONE_PORTRAIT_MARKER_ICON_OPACITY,
  PHONE_PORTRAIT_MARKER_ICON_PX,
} from '@/lib/map/phonePortraitMapPresentation';
import { getPhonePortraitMarkerConditionIconDataUri } from '@/lib/map/phonePortraitConditionIcons';

type KarlMapMarkerViewProps = {
  location: KarlMapMarkerLocation;
  isSelected: boolean;
  showScore?: boolean;
  showLocationLabel?: boolean;
  /** Phone portrait: icon-only when false; label + clear-sky score when true. */
  showMarkerMeta?: boolean;
  size?: 'compact' | 'regular';
  isNighttime?: boolean;
  useSvgIcons?: boolean;
};

function PhonePortraitMarkerIcon({
  intensity,
  isNighttime,
  size,
}: {
  intensity: ReturnType<typeof getMarkerVisualState>['intensity'];
  isNighttime: boolean;
  size: number;
}) {
  if (intensity === 'karlTerritory') {
    return <KarlLogo size={Math.round(size * 0.88)} />;
  }

  return (
    <Image
      source={{
        uri: getPhonePortraitMarkerConditionIconDataUri(intensity, {
          isNighttime,
        }),
      }}
      style={{
        width: size,
        height: size,
        opacity: PHONE_PORTRAIT_MARKER_ICON_OPACITY,
      }}
      contentFit="contain"
      accessibilityElementsHidden
      pointerEvents="none"
    />
  );
}

export function KarlMapMarkerView({
  location,
  isSelected,
  showScore = true,
  showLocationLabel = false,
  showMarkerMeta,
  size = 'regular',
  isNighttime = false,
  useSvgIcons = false,
}: KarlMapMarkerViewProps) {
  const visual = getMarkerVisualState(location, isSelected);
  const score = getPhonePortraitMarkerScoreValue(location);
  const isCompact = size === 'compact';
  const scoreColor = isCompact ? Colors.gold : getScoreBadgeColor(score);
  const symbol = getMarkerConditionSymbol(visual.intensity, isNighttime);
  const iconSize = isCompact ? PHONE_PORTRAIT_MARKER_ICON_PX : 24;
  const usePhonePortraitMeta = isCompact && showMarkerMeta !== undefined;

  return (
    <View
      style={[
        styles.root,
        !isCompact && { transform: [{ scale: visual.scale }] },
        isCompact && styles.rootCompact,
        isCompact && isSelected && styles.rootCompactSelected,
      ]}>
      <View
        style={[
          styles.iconWrap,
          isCompact && isSelected && styles.iconWrapSelected,
          isCompact &&
            isSelected && { transform: [{ scale: 1.06 }] },
        ]}>
        {isCompact && useSvgIcons ? (
          <PhonePortraitMarkerIcon
            intensity={visual.intensity}
            isNighttime={isNighttime}
            size={iconSize}
          />
        ) : useSvgIcons ? (
          <ConditionIcon
            intensity={visual.intensity}
            isNighttime={isNighttime}
            size={iconSize}
          />
        ) : (
          <Text
            style={[
              styles.symbol,
              isCompact ? styles.symbolCompact : styles.symbolRegular,
              visual.intensity === 'clear' &&
                (isNighttime ? styles.symbolClearNight : styles.symbolClearDay),
              isSelected && !isCompact && styles.symbolSelected,
            ]}>
            {symbol}
          </Text>
        )}
      </View>

      {usePhonePortraitMeta ? (
        showMarkerMeta ? (
          <View style={styles.metaBlock}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.locationLabelCompact}>
              {location.name}
            </Text>
            {showScore ? (
              <Text style={[styles.scoreTextCompact, { color: scoreColor }]}>
                {score}
              </Text>
            ) : null}
          </View>
        ) : null
      ) : (
        <>
          {showLocationLabel ? (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.locationLabel,
                isCompact && styles.locationLabelCompact,
              ]}>
              {location.name}
            </Text>
          ) : null}

          {showScore ? (
            <Text
              style={[
                styles.scoreText,
                isCompact && styles.scoreTextCompact,
                { color: scoreColor },
                isSelected && !isCompact && styles.scoreTextSelected,
              ]}>
              {score}
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}

export function MapConditionIcon({
  location,
  isSelected = false,
  size = 44,
  isNighttime = false,
}: {
  location: KarlMapMarkerLocation;
  isSelected?: boolean;
  size?: number;
  isNighttime?: boolean;
}) {
  const visual = getMarkerVisualState(location, isSelected);

  return (
    <View style={[styles.previewIcon, { width: size, height: size }]}>
      <ConditionIcon
        intensity={visual.intensity}
        isNighttime={isNighttime}
        size={Math.round(size * 0.72)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 1,
  },
  rootCompact: {
    gap: 2,
  },
  rootCompactSelected: {
    zIndex: 4,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: {
    shadowColor: Colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  metaBlock: {
    alignItems: 'center',
    gap: 2,
    maxWidth: 128,
  },
  symbol: {
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  symbolRegular: {
    fontSize: 22,
    lineHeight: 24,
  },
  symbolCompact: {
    fontSize: 20,
    lineHeight: 22,
  },
  symbolClearDay: {
    color: Colors.gold,
  },
  symbolClearNight: {
    color: '#8CB8D8',
  },
  symbolSelected: {
    textShadowColor: 'rgba(242, 163, 38, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 13,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scoreTextCompact: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.24,
    color: 'rgba(242, 163, 38, 0.95)',
    textShadowRadius: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
  },
  locationLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
    maxWidth: 112,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  locationLabelCompact: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.17,
    maxWidth: 136,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scoreTextSelected: {
    color: Colors.gold,
  },
  previewIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
