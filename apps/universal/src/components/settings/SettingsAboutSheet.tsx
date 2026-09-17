import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { KarlLogo } from '@/components/brand/KarlLogo';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { SETTINGS_BRANDED_DISPLAY } from '@/lib/settings/settingsBrandTypography';
import { SettingsChrome } from '@/lib/settings/settingsChrome';
import {
  SETTINGS_ABOUT_PARAGRAPHS,
  SETTINGS_COPY,
} from '@/lib/settings/settingsCopy';

type SettingsAboutSheetProps = {
  visible: boolean;
  versionLabel: string;
  onClose: () => void;
};

/**
 * Settings-local About presentation. No new route / navigation architecture.
 *
 * Navy-backed glass is a SIBLING background layer. Karl and copy sit in front
 * of it, never as GlassView descendants — iOS liquid glass tints children and
 * previously washed out Karl's approved dark eyes/smile.
 */
export function SettingsAboutSheet({
  visible,
  versionLabel,
  onClose,
}: SettingsAboutSheetProps) {
  const usesNativeGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss about Where's Karl"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.panel}>
          {usesNativeGlass ? (
            <GlassView
              glassEffectStyle="regular"
              tintColor={SettingsChrome.aboutPanelTint}
              colorScheme="dark"
              style={styles.panelGlass}
            />
          ) : (
            <View style={styles.panelFill} />
          )}
          <View style={styles.inner}>
            <View style={styles.markWrap}>
              <KarlLogo size={72} />
            </View>
            <Text style={styles.title} allowFontScaling={false}>
              {SETTINGS_COPY.aboutSheetTitle}
            </Text>
            {SETTINGS_ABOUT_PARAGRAPHS.map((paragraph) => (
              <Text key={paragraph} style={styles.body}>
                {paragraph}
              </Text>
            ))}
            <Text style={styles.version}>{versionLabel}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={SETTINGS_COPY.aboutClose}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closePressed,
              ]}>
              <Text style={styles.closeLabel}>{SETTINGS_COPY.aboutClose}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: SettingsChrome.aboutOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SettingsChrome.aboutPanelBorder,
    overflow: 'hidden',
  },
  panelGlass: {
    ...StyleSheet.absoluteFill,
  },
  panelFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: SettingsChrome.aboutPanelFill,
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  markWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    ...SETTINGS_BRANDED_DISPLAY,
    fontSize: 24,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  version: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
  },
  closeButton: {
    marginTop: Spacing.sm,
    minHeight: 44,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: Spacing.lg,
  },
  closePressed: {
    opacity: 0.72,
  },
  closeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
