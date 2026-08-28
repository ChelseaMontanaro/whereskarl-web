import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KarlLogo } from '@/components/brand/KarlLogo';
import { ClearestSpotMeter } from '@/components/home/ClearestSpotMeter';
import {
  ClearSkiesScoreSlider,
  FogCoverageSlider,
} from '@/components/home/MetricPercentSlider';
import { Colors, Radius } from '@/constants/theme';
import {
  resolveFogCoverageMetricIcon,
  resolveHomeClearConditionIconUri,
  type HomeMetricIconRef,
} from '@/lib/home/homeMetricIcons';
import {
  METRIC_DETAILS,
  metricDetailAriaLabel,
  type MetricDetailKey,
} from '@/lib/home/metricDetails';
import { resolveKarlStatusPhrase } from '@/lib/home/weatherDisplay';
import type {
  BestSunshineResponse,
  CurrentResponse,
  KarlIntelligenceResponse,
} from '@whereskarl/schemas';

/** Modest bump from Phase 23.1 first pass (22) toward web’s 32px Map icons. */
const METRIC_ICON_SIZE = 28;

type DashboardGridProps = {
  current: CurrentResponse | null;
  bestSunshine: BestSunshineResponse | null;
  intelligence?: KarlIntelligenceResponse | null;
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
  valueIsPhrase = false,
  gauge,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  value: string;
  detail: string;
  isLoading: boolean;
  icon: HomeMetricIconRef;
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
          <MetricIcon icon={icon} />
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
        label="Karl Status"
        value={
          isLoading || !current
            ? '--'
            : resolveKarlStatusPhrase({ current, intelligence }) ?? '--'
        }
        detail={isLoading ? 'Checking conditions' : 'Across the Bay'}
        isLoading={isLoading}
        icon={{ kind: 'karlLogo' }}
        valueIsPhrase
        onPress={() => openMetricDetail('karl-status')}
        accessibilityLabel={metricDetailAriaLabel(
          METRIC_DETAILS['karl-status'].title,
        )}
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
    paddingRight: 34,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.42)',
  },
  cardValue: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: '300',
    lineHeight: 30,
    color: 'rgba(255,255,255,0.94)',
  },
  cardValuePhrase: {
    // Still subordinate to numeric values; room for up to 3 lines.
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 21,
    flexShrink: 1,
  },
  cardValueLoading: {
    opacity: 0.35,
  },
  cardDetail: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
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
