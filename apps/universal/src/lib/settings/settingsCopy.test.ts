import { describe, expect, it } from 'vitest';

import {
  SETTINGS_ABOUT_PARAGRAPHS,
  SETTINGS_COPY,
} from '@/lib/settings/settingsCopy';

describe('Phase 26 — Settings copy inventory', () => {
  it('includes the approved header, preferences, about, and footer copy', () => {
    expect(SETTINGS_COPY.title).toBe('Settings');
    expect(SETTINGS_COPY.subtitle).toBe('Make Karl work your way.');
    expect(SETTINGS_COPY.preferencesEyebrow).toBe('Preferences');
    expect(SETTINGS_COPY.temperatureTitle).toBe('Temperature Unit');
    expect(SETTINGS_COPY.temperatureSupport).toBe(
      'Choose how the temperature is displayed.',
    );
    expect(SETTINGS_COPY.comingSoon).toBe('Coming Soon');
    expect(SETTINGS_COPY.fahrenheit).toBe('°F');
    expect(SETTINGS_COPY.celsius).toBe('°C');
    expect(SETTINGS_COPY.aboutEyebrow).toBe('About & Support');
    expect(SETTINGS_COPY.aboutTitle).toBe("About Where's Karl");
    expect(SETTINGS_COPY.aboutSupport).toBe(
      'Our story, the mission, and app details.',
    );
    expect(SETTINGS_COPY.aboutSheetTitle).toBe('Meet Karl.');
    expect(SETTINGS_COPY.helpTitle).toBe('Help & Support');
    expect(SETTINGS_COPY.helpSupport).toBe(
      'Get help or send us a message.',
    );
    expect(SETTINGS_COPY.privacyTitle).toBe('Privacy Policy');
    expect(SETTINGS_COPY.privacySupport).toBe(
      'How we protect your information.',
    );
    expect(SETTINGS_COPY.productName).toBe("Where's Karl");
    expect(SETTINGS_COPY.footerTagline).toBe(
      'Made for brighter days around the Bay.',
    );
  });

  it('does not include Home Location, Favorites, or Saved Locations language', () => {
    const inventory = [
      ...Object.values(SETTINGS_COPY),
      ...SETTINGS_ABOUT_PARAGRAPHS,
    ]
      .join(' ')
      .toLowerCase();

    expect(inventory).not.toContain('home location');
    expect(inventory).not.toContain('favorites management');
    expect(inventory).not.toContain('saved locations');
    expect(inventory).not.toContain('favorite location');
    expect(SETTINGS_COPY).not.toHaveProperty('homeLocationTitle');
  });

  it('uses the approved About sheet copy', () => {
    expect(SETTINGS_ABOUT_PARAGRAPHS).toEqual([
      "Karl the Fog has a habit of showing up whenever he feels like it. Where's Karl helps you see where he's hanging out — and where the sunshine is winning.",
      'From San Francisco to the North, East and South Bay, explore live conditions across the Bay Area and find your brightest spot.',
    ]);
  });
});
