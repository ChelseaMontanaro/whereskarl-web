import { StyleSheet, Text, View } from 'react-native';
import type { AirQualityPresentation } from '@whereskarl/domain';

import {
  airQualityMeterAriaLabel,
  airQualityMeterFillPercent,
} from '@/lib/home/airQualityMetric';

/** Neutral indicator used when the backend reports AQI as unavailable. */
const UNAVAILABLE_COLOR = 'rgba(255,255,255,0.45)';

type AirQualityMeterProps = {
  presentation: AirQualityPresentation;
};

/**
 * Bay-wide AQI band meter — same control family as the Fog / Clear Skies /
 * Clearest Spot meters (4pt track, 14pt bead, endpoint labels), but scaled by
 * canonical AQI band rather than by percent. Fill colour is the backend's own
 * band colour token.
 */
export function AirQualityMeter({ presentation }: AirQualityMeterProps) {
  const fillPercent = airQualityMeterFillPercent(presentation);
  const bandColor = presentation.color ?? UNAVAILABLE_COLOR;

  return (
    <View
      style={styles.root}
      accessible
      accessibilityRole="image"
      accessibilityLabel={airQualityMeterAriaLabel(presentation)}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${fillPercent}%`, backgroundColor: bandColor },
          ]}
        />
        <View
          style={[styles.bead, { left: `${fillPercent}%`, borderColor: bandColor }]}
        />
      </View>
      <View
        style={styles.labels}
        importantForAccessibility="no-hide-descendants">
        <Text style={styles.label} allowFontScaling={false}>
          Good
        </Text>
        <Text style={styles.label} allowFontScaling={false}>
          Hazardous
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    paddingTop: 12,
  },
  track: {
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
  },
  bead: {
    position: 'absolute',
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  labels: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    // Matches the Fog / Clear Skies / Clearest Spot endpoint labels
    // (Phase 23 closeout contrast bump).
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.62)',
  },
});
