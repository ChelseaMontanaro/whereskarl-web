import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { SettingsChrome } from '@/lib/settings/settingsChrome';
import {
  settingsRowIconDataUri,
  type SettingsRowIconKind,
} from '@/lib/settings/settingsIcons';
import { SETTINGS_ICON_WELL_SIZE } from '@/lib/settings/settingsLayout';

const ICON_SIZE = 18;

type SettingsRowIconProps = {
  kind: SettingsRowIconKind;
};

export function SettingsRowIcon({ kind }: SettingsRowIconProps) {
  return (
    <View style={styles.well} accessibilityElementsHidden>
      <Image
        source={{ uri: settingsRowIconDataUri(kind, SettingsChrome.iconColor) }}
        style={styles.icon}
        contentFit="contain"
        accessibilityElementsHidden
      />
    </View>
  );
}

const styles = StyleSheet.create({
  well: {
    width: SETTINGS_ICON_WELL_SIZE,
    height: SETTINGS_ICON_WELL_SIZE,
    borderRadius: SETTINGS_ICON_WELL_SIZE / 2,
    backgroundColor: SettingsChrome.iconWellFill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});
