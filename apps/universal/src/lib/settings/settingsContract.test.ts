import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '@/constants/storage';
import { SETTINGS_COPY } from '@/lib/settings/settingsCopy';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const SETTINGS_SCREEN = 'src/app/settings.tsx';
const SETTINGS_FOOTER = 'src/components/settings/SettingsFooter.tsx';
const SETTINGS_ABOUT = 'src/components/settings/SettingsAboutSheet.tsx';
const KARL_LOGO_RESOLVER = 'src/lib/brand/karlLogo.ts';
const KARL_LOGO_COMPONENT = 'src/components/brand/KarlLogo.tsx';
const STORAGE_KEYS_FILE = 'src/constants/storage.ts';
const APP_JSON = 'app.json';

describe('Phase 26 — Settings source contracts', () => {
  it('renders the approved content inventory and omits Favorites / Home Location', () => {
    const screen = readSource(SETTINGS_SCREEN);
    const header = readSource('src/components/settings/SettingsHeader.tsx');
    const footer = readSource(SETTINGS_FOOTER);

    expect(header).toContain('SETTINGS_COPY.title');
    expect(header).toContain('SETTINGS_COPY.subtitle');
    expect(screen).not.toContain('SETTINGS_COPY.preferencesEyebrow');
    expect(screen).not.toContain('SETTINGS_COPY.temperatureTitle');
    expect(screen).toContain('SETTINGS_COPY.aboutTitle');
    expect(screen).toContain('SETTINGS_COPY.helpTitle');
    expect(screen).toContain('SETTINGS_COPY.privacyTitle');
    expect(footer).toContain('SETTINGS_COPY.productName');
    expect(SETTINGS_COPY.footerTagline).toBe(
      'Made for brighter days around the Bay.',
    );

    expect(screen).not.toContain('Home Location');
    expect(screen).not.toContain('useHomeLocation');
    expect(screen).not.toContain('homeLocation');
    expect(screen).not.toContain('settingsHomeLocation');
    expect(screen.toLowerCase()).not.toContain('favorites management');
    expect(screen.toLowerCase()).not.toContain('saved locations');
    expect(screen).not.toContain('useFavorites');
    expect(screen).not.toContain('/favorites');
  });

  it('omits the unfinished Temperature Unit preference without adding conversion', () => {
    const screen = readSource(SETTINGS_SCREEN);
    const storage = readSource(STORAGE_KEYS_FILE);

    expect(screen).not.toContain('TemperatureUnitControl');
    expect(screen).not.toContain('SETTINGS_COPY.fahrenheit');
    expect(screen).not.toContain('SETTINGS_COPY.celsius');
    expect(screen).not.toContain('SETTINGS_COPY.comingSoon');
    expect(screen).not.toMatch(/celsiusToFahrenheit|fahrenheitToCelsius/);
    expect(screen).not.toContain('AsyncStorage');
    expect(screen).not.toMatch(/whereskarl\.temperature/i);
    expect(storage).not.toContain('temperature');
    expect(screen).not.toContain('setHomeLocationId');
  });

  it('does not surface Home Location while leaving canonical persistence intact elsewhere', () => {
    const screen = readSource(SETTINGS_SCREEN);
    const storage = readSource(STORAGE_KEYS_FILE);

    expect(screen).not.toContain('STORAGE_KEYS');
    expect(screen).not.toContain('whereskarl.homeLocationId');
    expect(STORAGE_KEYS.homeLocationId).toBe('whereskarl.homeLocationId');
    expect(storage).toContain("homeLocationId: 'whereskarl.homeLocationId'");
  });

  it('opens Help & Support and Privacy Policy in the in-app browser', () => {
    const screen = readSource(SETTINGS_SCREEN);
    const rows = readSource('src/components/settings/SettingsRows.tsx');

    expect(screen).toContain('SETTINGS_COPY.helpTitle');
    expect(screen).toContain('SETTINGS_COPY.helpSupport');
    expect(screen).toContain('SETTINGS_COPY.privacyTitle');
    expect(screen).toContain('SETTINGS_COPY.privacySupport');
    expect(screen).toContain("from 'expo-web-browser'");
    expect(screen).toContain('WebBrowser.openBrowserAsync');
    expect(screen).toContain(
      "const SETTINGS_SUPPORT_URL = 'https://whereskarl.live/support'",
    );
    expect(screen).toContain(
      "const SETTINGS_PRIVACY_URL = 'https://whereskarl.live/privacy'",
    );
    expect(screen).toContain(
      'openSettingsExternalDestination(SETTINGS_SUPPORT_URL)',
    );
    expect(screen).toContain(
      'openSettingsExternalDestination(SETTINGS_PRIVACY_URL)',
    );
    expect(screen).toContain('icon="help"');
    expect(screen).toContain('icon="privacy"');
    expect(rows).toContain('accessibilityRole="button"');
    expect(screen).not.toContain('SettingsComingSoonBadge');
    expect(screen).not.toContain('SettingsInfoRow');
    expect(screen).not.toContain('SETTINGS_COPY.comingSoon');
    expect(screen).not.toContain('WebView');
    expect(screen).not.toContain('react-native-webview');
  });

  it('presents About locally with the approved Meet Karl copy', () => {
    const screen = readSource(SETTINGS_SCREEN);
    const about = readSource(SETTINGS_ABOUT);

    expect(screen).toContain('SettingsAboutSheet');
    expect(screen).not.toContain("router.push('/about'");
    expect(about).toContain('SETTINGS_COPY.aboutSheetTitle');
    expect(about).toContain('SETTINGS_ABOUT_PARAGRAPHS');
    expect(about).not.toContain("from '@/components/settings/SettingsGlassCard'");
  });

  it('renders the canonical Karl brand mark without tint or GlassView descendant mutation', () => {
    const footer = readSource(SETTINGS_FOOTER);
    const about = readSource(SETTINGS_ABOUT);
    const resolver = readSource(KARL_LOGO_RESOLVER);
    const logo = readSource(KARL_LOGO_COMPONENT);

    expect(footer).toContain("from '@/components/brand/KarlLogo'");
    expect(footer).toContain('<KarlLogo');
    expect(about).toContain("from '@/components/brand/KarlLogo'");
    expect(about).toContain('<KarlLogo');
    expect(resolver).toContain('wheres-karl-logo.png');
    expect(logo).not.toContain('tintColor');
    expect(footer).not.toContain('tintColor');
    expect(about).not.toContain('logo-glow');
    expect(footer).not.toContain('logo-glow');
    expect(footer).not.toContain('expo-symbols');
    expect(footer).not.toContain('SymbolView');

    const glassOpen = about.indexOf('<GlassView');
    const glassSelfClose = about.indexOf('/>', glassOpen);
    const karl = about.indexOf('<KarlLogo');
    expect(glassOpen).toBeGreaterThan(-1);
    expect(glassSelfClose).toBeGreaterThan(glassOpen);
    expect(karl).toBeGreaterThan(glassSelfClose);
  });

  it('uses a fixed non-scrolling Settings screen rather than ScrollView', () => {
    const screen = readSource(SETTINGS_SCREEN);

    expect(screen).not.toContain('ScrollView');
    expect(screen).not.toContain('scrollEnabled');
    expect(screen).not.toContain('scrollClip');
    expect(screen).toContain('resolveSettingsVerticalRhythm');
    expect(screen).toContain('statusBarInset');
    expect(screen).not.toContain('statusBarScrim');
  });

  it('uses the Home-canonical branded font for Settings and Meet Karl.', () => {
    const header = readSource('src/components/settings/SettingsHeader.tsx');
    const about = readSource(SETTINGS_ABOUT);
    const homeHero = readSource('src/components/home/HomeHero.tsx');

    expect(homeHero).toContain('fontFamily: Fonts?.serif');
    expect(homeHero).toContain('letterSpacing: 0.3');
    expect(header).toContain('SETTINGS_BRANDED_DISPLAY');
    expect(header).toContain('SETTINGS_BRANDED_TAGLINE');
    expect(about).toContain('SETTINGS_BRANDED_DISPLAY');
    expect(header).toContain('allowFontScaling={false}');
    expect(about).toContain('allowFontScaling={false}');
  });

  it('keeps a navy About card with only a subtle neutral backdrop', () => {
    const about = readSource(SETTINGS_ABOUT);
    const chrome = readSource('src/lib/settings/settingsChrome.ts');

    expect(about).toContain('SettingsChrome.aboutOverlay');
    expect(about).toContain("colorScheme=\"dark\"");
    expect(chrome).toContain("aboutOverlay: 'rgba(0, 0, 0, 0.16)'");
    expect(chrome).not.toContain("aboutOverlay: 'rgba(3, 11, 20, 0.72)'");
    expect(chrome).toContain("aboutPanelFill: 'rgba(3, 11, 20, 0.74)'");
  });

  it('floats the footer over atmosphere without a frost/card container', () => {
    const footer = readSource(SETTINGS_FOOTER);

    expect(footer).toContain('<KarlLogo');
    expect(footer).toContain('size={52}');
    expect(footer).toContain('SETTINGS_COPY.productName');
    expect(footer).toContain('SETTINGS_COPY.footerTagline');
    expect(footer).toContain('Colors.textPrimary');
    expect(footer).toContain('Colors.textSecondary');
    expect(footer).toContain("textShadowColor: 'rgba(0, 0, 0, 0.45)'");
    expect(footer).not.toContain('SettingsChrome.glassFill');
    expect(footer).not.toContain('SettingsChrome.textPrimary');
    expect(footer).not.toContain('styles.panel');
    expect(footer).not.toContain('<GlassView');
    expect(footer).not.toContain('SettingsGlassCard');
    expect(footer).not.toContain('borderWidth');
    expect(footer).not.toContain('backgroundColor');
  });

  it('reproduces the Home MetricCard glass surface on Preferences and About & Support', () => {
    const screen = readSource(SETTINGS_SCREEN);
    const card = readSource('src/components/settings/SettingsGlassCard.tsx');
    const homeGrid = readSource('src/components/home/DashboardGrid.tsx');
    const rows = readSource('src/components/settings/SettingsRows.tsx');
    const footer = readSource(SETTINGS_FOOTER);
    const about = readSource(SETTINGS_ABOUT);

    expect(screen).toContain('<SettingsGlassCard>');
    expect(homeGrid).toContain("backgroundColor: 'rgba(0,0,0,0.4)'");
    expect(homeGrid).toContain('Colors.glassBorder');
    expect(card).toContain("backgroundColor: 'rgba(0,0,0,0.4)'");
    expect(card).toContain('Colors.glassBorder');
    expect(card).toContain('Radius.lg');
    expect(card).not.toContain('GlassView');
    expect(card).not.toContain('LiquidGlassSurface');
    expect(card).not.toContain("colorScheme=\"light\"");
    expect(card).not.toContain('SettingsChrome.glassTint');
    expect(card).not.toContain('SettingsChrome.glassFill');

    expect(rows).toContain('Colors.textPrimary');
    expect(rows).toContain("color: 'rgba(255,255,255,0.72)'");
    expect(homeGrid).toContain("color: 'rgba(255,255,255,0.72)'");

    expect(footer).toContain('Colors.textPrimary');
    expect(footer).not.toContain('SettingsGlassCard');
    expect(about).toContain('SettingsChrome.aboutOverlay');
    expect(about).toContain("colorScheme=\"dark\"");
  });

  it('derives version from Expo metadata rather than hardcoding a build number', () => {
    const screen = readSource(SETTINGS_SCREEN);
    const appJson = readSource(APP_JSON);

    expect(screen).toContain('resolveSettingsAppVersionLabel');
    expect(screen).toContain('Constants.expoConfig');
    expect(screen).not.toContain('Version 1.0.0 (1)');
    expect(appJson).toContain('"version": "1.0.0"');
    expect(appJson).toContain('"buildNumber": "2"');
  });

  it('does not change frozen bottom navigation, Home, Map, or Favorites', () => {
    const screen = readSource(SETTINGS_SCREEN);
    expect(screen).not.toContain('BottomNav');
    expect(screen).not.toContain('primaryNavItems');
    expect(screen).not.toContain("from '@/app/index");
    expect(screen).not.toContain("from '@/app/map");
    expect(screen).not.toContain("from '@/app/favorites");
  });
});
