import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ClearestSpotGauge } from '@/components/home/ClearestSpotGauge';
import {
  ClearSkiesScoreSlider,
  FogCoverageSlider,
} from '@/components/home/MetricPercentSlider';
import { Colors, Radius } from '@/constants/theme';
import {
  HOME_FOG_COVERAGE_ICON_URI,
  HOME_MOON_ICON_URI,
  HOME_SUNSHINE_ICON_URI,
} from '@/lib/home/homeConditionIcons';
import { resolveKarlStatusPhrase } from '@/lib/home/weatherDisplay';
import { buildMapHref } from '@/lib/navigation';
import type {
  BestSunshineResponse,
  CurrentResponse,
  KarlIntelligenceResponse,
} from '@whereskarl/schemas';

type DashboardGridProps = {
  current: CurrentResponse | null;
  bestSunshine: BestSunshineResponse | null;
  intelligence?: KarlIntelligenceResponse | null;
  isLoading: boolean;
  isNightPresentation?: boolean;
};

function MetricIcon({ uri, size = 22 }: { uri: string; size?: number }) {
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityElementsHidden
    />
  );
}

function MetricCard({
  label,
  value,
  detail,
  isLoading,
  iconUri,
  valueIsPhrase = false,
  gauge,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  value: string;
  detail: string;
  isLoading: boolean;
  iconUri: string;
  valueIsPhrase?: boolean;
  gauge?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const content = (
    <View style={[styles.card, gauge ? styles.cardWithGauge : null]}>
      <View style={styles.cardTop}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text
            style={[
              styles.cardValue,
              valueIsPhrase && styles.cardValuePhrase,
              isLoading && styles.cardValueLoading,
            ]}
            // Match mobile-web Karl Status (line-clamp-3); numeric metrics stay single-line.
            numberOfLines={valueIsPhrase ? 3 : 1}>
            {value}
          </Text>
          <Text style={styles.cardDetail}>{detail}</Text>
        </View>
        <View style={styles.iconFrame}>
          <MetricIcon uri={iconUri} />
        </View>
      </View>
      {gauge}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={styles.cardPressable}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.cardPressable}>{content}</View>;
}

export function DashboardGrid({
  current,
  bestSunshine,
  intelligence = null,
  isLoading,
  isNightPresentation = false,
}: DashboardGridProps) {
  const spotIconUri = isNightPresentation
    ? HOME_MOON_ICON_URI
    : HOME_SUNSHINE_ICON_URI;

  const clearestPress =
    !isLoading && bestSunshine?.locationID
      ? () => {
          router.push(buildMapHref(bestSunshine.locationID) as '/map');
        }
      : undefined;

  return (
    <View
      style={styles.grid}
      accessibilityLabel="Bay Area conditions dashboard">
      <MetricCard
        label="Fog Coverage"
        value={isLoading || !current ? '--' : `${current.fogCoverage}%`}
        detail={isLoading ? 'Checking conditions' : 'Bay Area'}
        isLoading={isLoading}
        iconUri={HOME_FOG_COVERAGE_ICON_URI}
        gauge={
          !isLoading && current ? (
            <FogCoverageSlider fogCoveragePercent={current.fogCoverage} />
          ) : null
        }
      />
      <MetricCard
        label="Karl Status"
        value={
          isLoading || !current
            ? '--'
            : resolveKarlStatusPhrase({ current, intelligence }) ?? '--'
        }
        detail={isLoading ? 'Checking conditions' : 'Across the Bay'}
        isLoading={isLoading}
        iconUri={HOME_FOG_COVERAGE_ICON_URI}
        valueIsPhrase
      />
      <MetricCard
        label="Clear Skies Score"
        value={isLoading || !current ? '--' : `${current.sunshineScore}`}
        detail={isLoading ? 'Checking conditions' : 'Bay Area average'}
        isLoading={isLoading}
        iconUri={HOME_SUNSHINE_ICON_URI}
        gauge={
          !isLoading && current ? (
            <ClearSkiesScoreSlider sunshineScore={current.sunshineScore} />
          ) : null
        }
      />
      <MetricCard
        label="Clearest Spot"
        value={
          isLoading || !bestSunshine ? '--' : `${bestSunshine.sunshineScore}`
        }
        detail={
          isLoading || !bestSunshine
            ? 'Finding brighter spots'
            : bestSunshine.locationName
        }
        isLoading={isLoading}
        iconUri={spotIconUri}
        onPress={clearestPress}
        accessibilityLabel={
          bestSunshine
            ? `View clearest spot on map: ${bestSunshine.locationName}`
            : 'Clearest Spot'
        }
        gauge={
          !isLoading && bestSunshine ? (
            <ClearestSpotGauge score={bestSunshine.sunshineScore} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  cardPressable: {
    width: '48.5%',
  },
  card: {
    minHeight: 148,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  cardWithGauge: {
    justifyContent: 'flex-end',
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 28,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.42)',
  },
  cardValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 26,
    color: 'rgba(255,255,255,0.94)',
  },
  cardValuePhrase: {
    // Web mobileKarlStatusValueClass: smaller phrase type, snug leading, up to 3 lines.
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 19,
    flexShrink: 1,
  },
  cardValueLoading: {
    opacity: 0.35,
  },
  cardDetail: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
  },
  iconFrame: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
