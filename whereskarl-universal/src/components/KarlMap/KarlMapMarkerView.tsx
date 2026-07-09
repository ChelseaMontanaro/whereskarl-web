import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { getMarkerConditionSymbol } from '@/lib/map/markerIcons';
import {
  CLEAR_SUN_COLOR,
  getMarkerVisualState,
  getScoreBadgeColor,
  type KarlMapMarkerLocation,
} from '@/lib/map/markerAppearance';

type KarlMapMarkerViewProps = {
  location: KarlMapMarkerLocation;
  isSelected: boolean;
  showScore?: boolean;
  size?: 'compact' | 'regular';
};

export function KarlMapMarkerView({
  location,
  isSelected,
  showScore = true,
  size = 'regular',
}: KarlMapMarkerViewProps) {
  const visual = getMarkerVisualState(location, isSelected);
  const score = Math.round(location.sunshineScore);
  const scoreColor = getScoreBadgeColor(score);
  const symbol = getMarkerConditionSymbol(visual.intensity);
  const isCompact = size === 'compact';

  return (
    <View
      style={[
        styles.root,
        { transform: [{ scale: visual.scale }] },
        isCompact && styles.rootCompact,
      ]}>
      <View
        style={[
          styles.ring,
          isCompact ? styles.ringCompact : styles.ringRegular,
          {
            borderColor: visual.borderColor,
            backgroundColor: 'rgba(3, 11, 20, 0.72)',
          },
          isSelected && styles.ringSelected,
        ]}>
        <View
          style={[
            styles.iconSurface,
            isCompact ? styles.iconSurfaceCompact : styles.iconSurfaceRegular,
            { backgroundColor: `${visual.fillColor}33` },
          ]}>
          <Text
            style={[
              styles.symbol,
              isCompact ? styles.symbolCompact : styles.symbolRegular,
              visual.intensity === 'clear' && styles.symbolClear,
            ]}>
            {symbol}
          </Text>
        </View>
      </View>

      {showScore ? (
        <View
          style={[
            styles.scoreBadge,
            isCompact && styles.scoreBadgeCompact,
            isSelected && styles.scoreBadgeSelected,
          ]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{score}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function MapConditionIcon({
  location,
  isSelected = false,
  size = 44,
}: {
  location: KarlMapMarkerLocation;
  isSelected?: boolean;
  size?: number;
}) {
  const visual = getMarkerVisualState(location, isSelected);
  const symbol = getMarkerConditionSymbol(visual.intensity);

  return (
    <View
      style={[
        styles.previewIcon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: visual.borderColor,
          backgroundColor: `${visual.fillColor}22`,
        },
      ]}>
      <Text
        style={[
          styles.previewSymbol,
          { fontSize: size * 0.42 },
          visual.intensity === 'clear' && styles.symbolClear,
        ]}>
        {symbol}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 2,
  },
  rootCompact: {
    gap: 1,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  ringRegular: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  ringCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  ringSelected: {
    shadowColor: Colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    borderWidth: 2.5,
  },
  iconSurface: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  iconSurfaceRegular: {
    width: 28,
    height: 28,
  },
  iconSurfaceCompact: {
    width: 24,
    height: 24,
  },
  symbol: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  symbolRegular: {
    fontSize: 16,
  },
  symbolCompact: {
    fontSize: 14,
  },
  symbolClear: {
    color: CLEAR_SUN_COLOR,
  },
  scoreBadge: {
    minWidth: 24,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(3, 11, 20, 0.88)',
    alignItems: 'center',
  },
  scoreBadgeCompact: {
    minWidth: 22,
    paddingHorizontal: 4,
  },
  scoreBadgeSelected: {
    borderColor: 'rgba(242, 163, 38, 0.35)',
    backgroundColor: 'rgba(242, 163, 38, 0.1)',
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  previewIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  previewSymbol: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
