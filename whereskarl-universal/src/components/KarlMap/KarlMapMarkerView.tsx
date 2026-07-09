import { StyleSheet, Text, View } from 'react-native';

import { ConditionIcon } from '@/components/conditions/ConditionIcon';
import { Colors } from '@/constants/theme';
import {
  getMarkerVisualState,
  getScoreBadgeColor,
  type KarlMapMarkerLocation,
} from '@/lib/map/markerAppearance';
import { getMarkerConditionSymbol } from '@/lib/map/markerIcons';

const PHONE_PORTRAIT_MARKER_ICON_SIZE = 40;

type KarlMapMarkerViewProps = {
  location: KarlMapMarkerLocation;
  isSelected: boolean;
  showScore?: boolean;
  showLocationLabel?: boolean;
  size?: 'compact' | 'regular';
  isNighttime?: boolean;
  useSvgIcons?: boolean;
};

export function KarlMapMarkerView({
  location,
  isSelected,
  showScore = true,
  showLocationLabel = false,
  size = 'regular',
  isNighttime = false,
  useSvgIcons = false,
}: KarlMapMarkerViewProps) {
  const visual = getMarkerVisualState(location, isSelected);
  const score = Math.round(location.sunshineScore);
  const isCompact = size === 'compact';
  const scoreColor = isCompact ? Colors.gold : getScoreBadgeColor(score);
  const symbol = getMarkerConditionSymbol(visual.intensity, isNighttime);
  const iconSize = isCompact ? PHONE_PORTRAIT_MARKER_ICON_SIZE : 24;

  return (
    <View
      style={[
        styles.root,
        !isCompact && { transform: [{ scale: visual.scale }] },
        isCompact && styles.rootCompact,
      ]}>
      <View
        style={[
          styles.iconWrap,
          isCompact && isSelected && styles.iconWrapSelected,
          isCompact &&
            isSelected && { transform: [{ scale: 1.08 }] },
        ]}>
        {useSvgIcons ? (
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
    gap: 3,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: {
    shadowColor: Colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
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
    fontWeight: '700',
    lineHeight: 14,
    textShadowRadius: 0,
    textShadowColor: 'transparent',
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
    lineHeight: 13,
    maxWidth: 112,
  },
  scoreTextSelected: {
    color: Colors.gold,
  },
  previewIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
