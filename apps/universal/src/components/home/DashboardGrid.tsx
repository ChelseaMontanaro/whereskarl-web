import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KarlLogo } from '@/components/brand/KarlLogo';
import { AirQualityMeter } from '@/components/home/AirQualityMeter';
import { ClearestSpotMeter } from '@/components/home/ClearestSpotMeter';
import {
  ClearSkiesScoreSlider,
  FogCoverageSlider,
} from '@/components/home/MetricPercentSlider';
import { Colors, Radius } from '@/constants/theme';
import {
  airQualityMetricDetail,
  airQualityMetricValue,
  bayWideAirQuality,
} from '@/lib/home/airQualityMetric';
import {
  resolveAirQualityMetricIconUri,
  resolveFogCoverageMetricIcon,
  resolveHomeClearConditionIconUri,
  type HomeMetricIconRef,
} from '@/lib/home/homeMetricIcons';
import {
  METRIC_DETAILS,
  metricDetailAriaLabel,
  type MetricDetailKey,
} from '@/lib/home/metricDetails';
import type { BestSunshineResponse, CurrentResponse } from '@whereskarl/schemas';

/** Web informational icon slot is 32 (`h-8 w-8`); Home now matches it. */
const METRIC_ICON_SIZE = 32;

type DashboardGridProps = {
  current: CurrentResponse | null;
  bestSunshine: BestSunshineResponse | null;
  isLoading: boolean;
  isNightPresentation?: boolean;
  onOpenMetricDetail: (key: MetricDetailKey) => void;
};

function MetricConditionIcon({
  uri,
  size = METRIC_ICON_SIZE,
}: {
  uri: string;
  size?: number;
}) {
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityElementsHidden
    />
  );
}

function MetricIcon({ icon }: { icon: HomeMetricIconRef }) {
  if (icon.kind === 'karlLogo') {
    return <KarlLogo size={METRIC_ICON_SIZE} />;
  }

  return <MetricConditionIcon uri={icon.uri} />;
}

function MetricCard({
  label,
  value,
  detail,
  isLoading,
  icon,
  gauge,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  value: string;
  detail: string;
  isLoading: boolean;
  icon: HomeMetricIconRef;
  gauge?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const content = (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardLabel} allowFontScaling={false}>
            {label}
          </Text>
          <Text
            style={[styles.cardValue, isLoading && styles.cardValueLoading]}
            allowFontScaling={false}
            // Every dashboard metric is now a numeric value: single line.
            numberOfLines={1}>
            {value}
          </Text>
          <Text style={styles.cardDetail} allowFontScaling={false}>
            {detail}
          </Text>
        </View>
        <View style={styles.iconFrame}>
          <MetricIcon icon={icon} />
        </View>
      </View>
      {/* Web meters use mt-auto inside a flex column — pin gauge to tile bottom. */}
      {gauge ? <View style={styles.gaugePin}>{gauge}</View> : null}
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
  isLoading,
  isNightPresentation = false,
  onOpenMetricDetail,
}: DashboardGridProps) {
  const openMetricDetail = (key: MetricDetailKey) => {
    if (isLoading) {
      return;
    }
    onOpenMetricDetail(key);
  };

  const fogIcon =
    !isLoading && current
      ? resolveFogCoverageMetricIcon(current.fogCoverage, {
          isNighttime: isNightPresentation,
        })
      : resolveFogCoverageMetricIcon(50, { isNighttime: isNightPresentation });

  const clearSkiesIconUri = resolveHomeClearConditionIconUri({
    isNighttime: false,
  });
  const clearestSpotIconUri = resolveHomeClearConditionIconUri({
    isNighttime: isNightPresentation,
  });
  const airQualityIconUri = resolveAirQualityMetricIconUri();

  // Bay-wide aggregate straight from the backend's `bay-area-current` payload.
  const airQuality = bayWideAirQuality(current);

  return (
    <View
      style={styles.grid}
      accessibilityLabel="Bay Area conditions dashboard">
      <MetricCard
        label="Fog Coverage"
        value={isLoading || !current ? '--' : `${current.fogCoverage}%`}
        detail={isLoading ? 'Checking conditions' : 'Bay Area'}
        isLoading={isLoading}
        icon={fogIcon}
        onPress={() => openMetricDetail('fog-coverage')}
        accessibilityLabel={metricDetailAriaLabel(
          METRIC_DETAILS['fog-coverage'].title,
        )}
        gauge={
          !isLoading && current ? (
            <FogCoverageSlider fogCoveragePercent={current.fogCoverage} />
          ) : null
        }
      />
      <MetricCard
        label="Air Quality"
        value={isLoading ? '--' : airQualityMetricValue(airQuality)}
        detail={
          isLoading ? 'Checking conditions' : airQualityMetricDetail(airQuality)
        }
        isLoading={isLoading}
        icon={{ kind: 'condition', uri: airQualityIconUri }}
        onPress={() => openMetricDetail('air-quality')}
        accessibilityLabel={metricDetailAriaLabel(
          METRIC_DETAILS['air-quality'].title,
        )}
        gauge={
          !isLoading && airQuality.available ? (
            <AirQualityMeter presentation={airQuality} />
          ) : null
        }
      />
      <MetricCard
        label="Clear Skies Score"
        value={isLoading || !current ? '--' : `${current.sunshineScore}`}
        detail={isLoading ? 'Checking conditions' : 'Bay Area average'}
        isLoading={isLoading}
        icon={{ kind: 'condition', uri: clearSkiesIconUri }}
        onPress={() => openMetricDetail('sunshine-score')}
        accessibilityLabel={metricDetailAriaLabel(
          METRIC_DETAILS['sunshine-score'].title,
        )}
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
        icon={{ kind: 'condition', uri: clearestSpotIconUri }}
        onPress={() => openMetricDetail('clearest-spot')}
        accessibilityLabel={metricDetailAriaLabel(
          METRIC_DETAILS['clearest-spot'].title,
        )}
        gauge={
          !isLoading && bestSunshine ? (
            <ClearestSpotMeter score={bestSunshine.sunshineScore} />
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
    // Web phone tile: max-sm:h-[9.25rem] (148). Equal height across the 2×2.
    height: 148,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 34,
  },
  cardLabel: {
    fontSize: 11,
    // Web mobileMetricTwoLineLabelClass: leading-[1.15]. Explicit so the
    // two-line "Clear Skies Score" tile has a deterministic height.
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    // Phase 23 closeout: web's text-white/42 read too faint over the
    // photographic hero background on physical iPhone. Bumped for
    // legibility; still clearly secondary to cardValue's 0.94 opacity.
    color: 'rgba(255,255,255,0.62)',
  },
  cardValue: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 30,
    color: 'rgba(255,255,255,0.94)',
  },
  cardValueLoading: {
    opacity: 0.35,
  },
  cardDetail: {
    marginTop: 6,
    // Web max-sm:text-xs / text-white/55, bumped for physical-iPhone
    // legibility (Phase 23 closeout) — still secondary to cardValue.
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
  },
  gaugePin: {
    marginTop: 'auto',
    width: '100%',
  },
  iconFrame: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
