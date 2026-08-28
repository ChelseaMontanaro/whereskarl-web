import { StyleSheet, Text, View } from 'react-native';

import {
  clearSkiesIndicatorAriaLabel,
  clampMetricPercent,
} from '@/lib/home/metricPercent';
import { fogCoverageIndicatorAriaLabel } from '@/lib/home/fogCoverageIndicator';

type MetricPercentSliderProps = {
  percent: number;
  variant: 'fog' | 'sunshine';
  leftLabel: string;
  rightLabel: string;
};

const FILL = {
  fog: 'rgb(140, 184, 216)',
  sunshine: 'rgb(242, 163, 38)',
} as const;

const KNOB_BORDER = {
  fog: '#8CB8D8',
  sunshine: 'rgb(242, 163, 38)',
} as const;

export function MetricPercentSlider({
  percent,
  variant,
  leftLabel,
  rightLabel,
}: MetricPercentSliderProps) {
  const clamped = clampMetricPercent(percent);
  const fillColor = FILL[variant];
  const ariaLabel =
    variant === 'fog'
      ? fogCoverageIndicatorAriaLabel(clamped)
      : clearSkiesIndicatorAriaLabel(clamped);

  return (
    <View
      style={styles.root}
      accessible
      accessibilityRole="image"
      accessibilityLabel={ariaLabel}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${clamped}%`, backgroundColor: fillColor },
          ]}
        />
        <View
          style={[
            styles.knob,
            {
              left: `${clamped}%`,
              borderColor: KNOB_BORDER[variant],
            },
          ]}
        />
      </View>
      <View style={styles.labels} importantForAccessibility="no-hide-descendants">
        <Text style={styles.label}>{leftLabel}</Text>
        <Text style={styles.label}>{rightLabel}</Text>
      </View>
    </View>
  );
}

export function FogCoverageSlider({
  fogCoveragePercent,
}: {
  fogCoveragePercent: number;
}) {
  return (
    <MetricPercentSlider
      percent={fogCoveragePercent}
      variant="fog"
      leftLabel="Clear"
      rightLabel="Thick"
    />
  );
}

export function ClearSkiesScoreSlider({
  sunshineScore,
}: {
  sunshineScore: number;
}) {
  return (
    <MetricPercentSlider
      percent={sunshineScore}
      variant="sunshine"
      leftLabel="Poor"
      rightLabel="Excellent"
    />
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 10,
    width: '100%',
    paddingTop: 2,
  },
  track: {
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'visible',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
  },
  knob: {
    position: 'absolute',
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOpacity: 0.12,
    shadowRadius: 1,
  },
  labels: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.42)',
  },
});
