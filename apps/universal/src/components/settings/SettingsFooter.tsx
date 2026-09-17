import { StyleSheet, Text, View } from 'react-native';

import { KarlLogo } from '@/components/brand/KarlLogo';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { SETTINGS_COPY } from '@/lib/settings/settingsCopy';

type SettingsFooterProps = {
  versionLabel: string;
};

/**
 * Branded Settings footer floats over atmosphere. Karl is unmodified
 * `KarlLogo` / `KARL_LOGO_IMAGE`. Light text + a text-only halo are the
 * only contrast aids — no footer card or container.
 */
export function SettingsFooter({ versionLabel }: SettingsFooterProps) {
  return (
    <View style={styles.footer} accessibilityRole="summary">
      <KarlLogo size={52} />
      <Text style={styles.productName}>{SETTINGS_COPY.productName}</Text>
      <Text style={styles.version}>{versionLabel}</Text>
      <Text style={styles.tagline}>{SETTINGS_COPY.footerTagline}</Text>
    </View>
  );
}

const FOOTER_TEXT_HALO = {
  textShadowColor: 'rgba(0, 0, 0, 0.45)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
} as const;

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    gap: 6,
  },
  productName: {
    marginTop: 4,
    fontFamily: Fonts?.serif,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    ...FOOTER_TEXT_HALO,
  },
  version: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    ...FOOTER_TEXT_HALO,
  },
  tagline: {
    fontFamily: Fonts?.serif,
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    ...FOOTER_TEXT_HALO,
  },
});
