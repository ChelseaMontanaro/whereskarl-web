import { StyleSheet, Text, View } from 'react-native';

import { SettingsComingSoonBadge } from '@/components/settings/SettingsComingSoonBadge';
import { SettingsChrome } from '@/lib/settings/settingsChrome';
import { SETTINGS_COPY } from '@/lib/settings/settingsCopy';
import {
  SETTINGS_TEMPERATURE_UNIT,
  isSettingsTemperatureControlInteractive,
} from '@/lib/settings/settingsTemperature';

/**
 * Visual-only °F / °C control. Not a Pressable. °F is the current default;
 * Celsius is shown only so the Coming Soon state is understandable.
 */
export function TemperatureUnitControl() {
  const fahrenheitSelected =
    SETTINGS_TEMPERATURE_UNIT.current === 'fahrenheit';
  const interactive = isSettingsTemperatureControlInteractive();

  return (
    <View
      style={styles.cluster}
      accessible
      accessibilityRole="text"
      accessibilityState={{ disabled: !interactive }}
      accessibilityLabel={`${SETTINGS_COPY.temperatureTitle}. ${SETTINGS_COPY.fahrenheit} selected. ${SETTINGS_COPY.comingSoon}. This setting is not available yet.`}>
      <View
        pointerEvents={interactive ? 'auto' : 'none'}
        importantForAccessibility="no-hide-descendants"
        style={styles.track}>
        <View
          style={[
            styles.segment,
            fahrenheitSelected && styles.segmentActive,
          ]}>
          <Text
            style={[
              styles.segmentLabel,
              fahrenheitSelected && styles.segmentLabelActive,
            ]}>
            {SETTINGS_COPY.fahrenheit}
          </Text>
        </View>
        <View style={styles.segment}>
          <Text style={styles.segmentLabel}>{SETTINGS_COPY.celsius}</Text>
        </View>
      </View>
      <SettingsComingSoonBadge />
    </View>
  );
}

const styles = StyleSheet.create({
  cluster: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  track: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: SettingsChrome.segmentTrack,
    padding: 2,
    gap: 1,
  },
  segment: {
    minWidth: 36,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: SettingsChrome.segmentActiveFill,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: SettingsChrome.segmentInactiveText,
  },
  segmentLabelActive: {
    color: SettingsChrome.segmentActiveText,
  },
});
