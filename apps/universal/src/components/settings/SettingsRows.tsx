import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { SettingsChrome } from '@/lib/settings/settingsChrome';
import type { SettingsRowIconKind } from '@/lib/settings/settingsIcons';
import { SETTINGS_CARD_PADDING_X } from '@/lib/settings/settingsLayout';

import { SettingsRowIcon } from './SettingsRowIcon';

const MIN_TOUCH = 44;

type SettingsInfoRowProps = {
  icon: SettingsRowIconKind;
  title: string;
  description: string;
  trailing: ReactNode;
  showDivider?: boolean;
  accessibilityLabel?: string;
};

export function SettingsInfoRow({
  icon,
  title,
  description,
  trailing,
  showDivider = false,
  accessibilityLabel,
}: SettingsInfoRowProps) {
  return (
    <View>
      <View
        style={styles.row}
        {...(accessibilityLabel
          ? {
              accessible: true as const,
              accessibilityRole: 'text' as const,
              accessibilityState: { disabled: true as const },
              accessibilityLabel,
            }
          : null)}>
        <SettingsRowIcon kind={icon} />
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {trailing}
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

type SettingsNavRowProps = {
  icon: SettingsRowIconKind;
  title: string;
  description: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  showDivider?: boolean;
  onPress: () => void;
};

export function SettingsNavRow({
  icon,
  title,
  description,
  accessibilityLabel,
  accessibilityHint,
  showDivider = true,
  onPress,
}: SettingsNavRowProps) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
        <SettingsRowIcon kind={icon} />
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Text style={styles.chevron} accessibilityElementsHidden>
          ›
        </Text>
      </Pressable>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
    minHeight: MIN_TOUCH,
    paddingHorizontal: SETTINGS_CARD_PADDING_X,
    paddingVertical: 12,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
    minHeight: MIN_TOUCH,
    paddingHorizontal: SETTINGS_CARD_PADDING_X,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.72,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.72)',
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '400',
    color: SettingsChrome.chevron,
    marginLeft: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SettingsChrome.divider,
    marginLeft: SETTINGS_CARD_PADDING_X + 36 + 12,
    marginRight: SETTINGS_CARD_PADDING_X,
  },
});
