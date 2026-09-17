import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsAboutSheet } from '@/components/settings/SettingsAboutSheet';
import { SettingsAtmosphereBackground } from '@/components/settings/SettingsAtmosphereBackground';
import { SettingsComingSoonBadge } from '@/components/settings/SettingsComingSoonBadge';
import { SettingsFooter } from '@/components/settings/SettingsFooter';
import { SettingsGlassCard } from '@/components/settings/SettingsGlassCard';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { SettingsInfoRow, SettingsNavRow } from '@/components/settings/SettingsRows';
import { SettingsSectionLabel } from '@/components/settings/SettingsSectionLabel';
import { TemperatureUnitControl } from '@/components/settings/TemperatureUnitControl';
import { BOTTOM_NAV_SCROLL_INSET } from '@/constants/bottomNav';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { resolveSettingsAppVersionLabel } from '@/lib/settings/settingsAppVersion';
import { SettingsChrome } from '@/lib/settings/settingsChrome';
import { SETTINGS_COPY } from '@/lib/settings/settingsCopy';
import { resolveSettingsVerticalRhythm } from '@/lib/settings/settingsLayout';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { horizontalPadding, height } = useResponsiveLayout();
  const [aboutOpen, setAboutOpen] = useState(false);
  const statusBarInset = Math.max(insets.top, Spacing.sm);
  const rhythm = resolveSettingsVerticalRhythm(height);

  const versionLabel = resolveSettingsAppVersionLabel({
    expoConfigVersion: Constants.expoConfig?.version ?? null,
    nativeApplicationVersion: Constants.nativeApplicationVersion ?? null,
    iosBuildNumber: Constants.expoConfig?.ios?.buildNumber ?? null,
    executionEnvironment: Constants.executionEnvironment ?? null,
  });

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark');
      return () => {
        setStatusBarStyle('light');
      };
    }, []),
  );

  return (
    <View style={styles.root}>
      <SettingsAtmosphereBackground />
      <View
        style={[
          styles.screen,
          {
            paddingTop: statusBarInset + rhythm.contentPaddingTop,
            paddingBottom:
              BOTTOM_NAV_SCROLL_INSET + Math.max(insets.bottom, Spacing.sm),
            paddingHorizontal: horizontalPadding,
          },
        ]}>
        <View style={[styles.content, { gap: rhythm.stackGap }]}>
          <SettingsHeader />

          <View style={[styles.section, { gap: rhythm.sectionGap }]}>
            <SettingsSectionLabel>
              {SETTINGS_COPY.preferencesEyebrow}
            </SettingsSectionLabel>
            <SettingsGlassCard>
              <SettingsInfoRow
                icon="temperature"
                title={SETTINGS_COPY.temperatureTitle}
                description={SETTINGS_COPY.temperatureSupport}
                trailing={<TemperatureUnitControl />}
              />
            </SettingsGlassCard>
          </View>

          <View style={[styles.section, { gap: rhythm.sectionGap }]}>
            <SettingsSectionLabel>
              {SETTINGS_COPY.aboutEyebrow}
            </SettingsSectionLabel>
            <SettingsGlassCard>
              <SettingsNavRow
                icon="about"
                title={SETTINGS_COPY.aboutTitle}
                description={SETTINGS_COPY.aboutSupport}
                accessibilityLabel={`${SETTINGS_COPY.aboutTitle}. ${SETTINGS_COPY.aboutSupport}`}
                onPress={() => setAboutOpen(true)}
              />
              <SettingsInfoRow
                icon="help"
                title={SETTINGS_COPY.helpTitle}
                description={SETTINGS_COPY.helpSupport}
                trailing={<SettingsComingSoonBadge />}
                showDivider
                accessibilityLabel={`${SETTINGS_COPY.helpTitle}. ${SETTINGS_COPY.helpSupport}. ${SETTINGS_COPY.comingSoon}. This is not available yet.`}
              />
              <SettingsInfoRow
                icon="privacy"
                title={SETTINGS_COPY.privacyTitle}
                description={SETTINGS_COPY.privacySupport}
                trailing={<SettingsComingSoonBadge />}
                accessibilityLabel={`${SETTINGS_COPY.privacyTitle}. ${SETTINGS_COPY.privacySupport}. ${SETTINGS_COPY.comingSoon}. This is not available yet.`}
              />
            </SettingsGlassCard>
          </View>

          <SettingsFooter versionLabel={versionLabel} />
        </View>
      </View>

      <SettingsAboutSheet
        visible={aboutOpen}
        versionLabel={versionLabel}
        onClose={() => setAboutOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SettingsChrome.fallbackAtmosphere,
  },
  screen: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  section: {
    width: '100%',
  },
});
