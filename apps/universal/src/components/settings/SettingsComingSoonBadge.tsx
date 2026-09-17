import { StyleSheet, Text, View } from 'react-native';

import { SettingsChrome } from '@/lib/settings/settingsChrome';
import { SETTINGS_COPY } from '@/lib/settings/settingsCopy';

export function SettingsComingSoonBadge() {
  return (
    <View style={styles.comingSoon} accessibilityElementsHidden>
      <Text style={styles.comingSoonLabel}>{SETTINGS_COPY.comingSoon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  comingSoon: {
    borderRadius: 8,
    backgroundColor: SettingsChrome.comingSoonFill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  comingSoonLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: SettingsChrome.comingSoonText,
  },
});
