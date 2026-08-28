import { StyleSheet, Text, View } from 'react-native';

import {
  clearestSpotMeterAriaLabel,
  clearestSpotMeterFillPercent,
} from '@/lib/home/clearestSpotMeter';

/** Clearest Spot indicator blue — distinct from Clear Skies gold slider. */
const CLEAREST_SPOT_METER_BLUE = 'rgb(140, 184, 216)';
const CLEAREST_SPOT_METER_BLUE_FILL = 'rgb(91, 155, 200)';

type ClearestSpotMeterProps = {
  score: number;
};

/**
 * Horizontal Poor → Best score meter — same indicator family as Fog Coverage /
 * Clear Skies Score sliders (track on top, endpoint labels underneath).
 */
export function ClearestSpotMeter({ score }: ClearestSpotMeterProps) {
  const fillPercent = clearestSpotMeterFillPercent(score);

  return (
    <View
      style={styles.root}
      accessible
      accessibilityRole="image"
      accessibilityLabel={clearestSpotMeterAriaLabel(score)}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillPercent}%` }]} />
        <View style={[styles.bead, { left: `${fillPercent}%` }]} />
      </View>
      <View
        style={styles.labels}
        importantForAccessibility="no-hide-descendants">
        <Text style={styles.label}>Poor</Text>
        <Text style={styles.label}>Best</Text>
      </View>
    </View>
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
    backgroundColor: CLEAREST_SPOT_METER_BLUE_FILL,
  },
  bead: {
    position: 'absolute',
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: CLEAREST_SPOT_METER_BLUE,
    backgroundColor: '#fff',
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
