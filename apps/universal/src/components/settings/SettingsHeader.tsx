import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import {
  SETTINGS_BRANDED_DISPLAY,
  SETTINGS_BRANDED_TAGLINE,
} from '@/lib/settings/settingsBrandTypography';
import { SettingsChrome } from '@/lib/settings/settingsChrome';
import { SETTINGS_COPY } from '@/lib/settings/settingsCopy';

export function SettingsHeader() {
  return (
    <View style={styles.header} accessibilityRole="header">
      <Text style={styles.title} allowFontScaling={false}>
        {SETTINGS_COPY.title}
      </Text>
      <Text
        style={styles.subtitle}
        allowFontScaling={false}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}>
        {SETTINGS_COPY.subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    width: '100%',
    gap: Spacing.xs,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  title: {
    ...SETTINGS_BRANDED_DISPLAY,
    fontSize: 34,
    color: SettingsChrome.textPrimary,
    textAlign: 'left',
  },
  subtitle: {
    ...SETTINGS_BRANDED_TAGLINE,
    textAlign: 'left',
  },
});
