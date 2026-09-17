import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { SettingsChrome } from '@/lib/settings/settingsChrome';

type SettingsSectionLabelProps = {
  children: string;
};

export function SettingsSectionLabel({ children }: SettingsSectionLabelProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 6,
    paddingTop: Spacing.sm,
    paddingBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: SettingsChrome.eyebrow,
    fontFamily: Fonts?.sans,
  },
});
