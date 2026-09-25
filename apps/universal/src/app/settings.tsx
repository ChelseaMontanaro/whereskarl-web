import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsAboutSheet } from '@/components/settings/SettingsAboutSheet';
import { SettingsAtmosphereBackground } from '@/components/settings/SettingsAtmosphereBackground';
import { SettingsFooter } from '@/components/settings/SettingsFooter';
import { SettingsGlassCard } from '@/components/settings/SettingsGlassCard';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { SettingsNavRow } from '@/components/settings/SettingsRows';
import { SettingsSectionLabel } from '@/components/settings/SettingsSectionLabel';
import { BOTTOM_NAV_SCROLL_INSET } from '@/constants/bottomNav';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { resolveSettingsAppVersionLabel } from '@/lib/settings/settingsAppVersion';
import { SettingsChrome } from '@/lib/settings/settingsChrome';
import { SETTINGS_COPY } from '@/lib/settings/settingsCopy';
import { resolveSettingsVerticalRhythm } from '@/lib/settings/settingsLayout';

const SETTINGS_SUPPORT_URL = 'https://whereskarl.live/support';
const SETTINGS_PRIVACY_URL = 'https://whereskarl.live/privacy';

function openSettingsExternalDestination(url: string) {
  void WebBrowser.openBrowserAsync(url);
}

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
              <SettingsNavRow
                icon="help"
                title={SETTINGS_COPY.helpTitle}
                description={SETTINGS_COPY.helpSupport}
                accessibilityLabel={`${SETTINGS_COPY.helpTitle}. ${SETTINGS_COPY.helpSupport}`}
                accessibilityHint="Opens the support page in the browser."
                onPress={() =>
                  openSettingsExternalDestination(SETTINGS_SUPPORT_URL)
                }
              />
              <SettingsNavRow
                icon="privacy"
                title={SETTINGS_COPY.privacyTitle}
                description={SETTINGS_COPY.privacySupport}
                accessibilityLabel={`${SETTINGS_COPY.privacyTitle}. ${SETTINGS_COPY.privacySupport}`}
                accessibilityHint="Opens the privacy policy in the browser."
                showDivider={false}
                onPress={() =>
                  openSettingsExternalDestination(SETTINGS_PRIVACY_URL)
                }
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
