import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('Phase 26 — Settings branded typography matches Home', () => {
  it('reuses Home hero title family, weight, and letter-spacing', () => {
    const home = readSource('src/components/home/HomeHero.tsx');
    const brand = readSource('src/lib/settings/settingsBrandTypography.ts');
    const header = readSource('src/components/settings/SettingsHeader.tsx');
    const about = readSource('src/components/settings/SettingsAboutSheet.tsx');

    expect(home).toContain('fontFamily: Fonts?.serif');
    expect(home).toContain("fontWeight: '600'");
    expect(home).toContain('letterSpacing: 0.3');

    expect(brand).toContain('fontFamily: Fonts?.serif');
    expect(brand).toContain("fontWeight: '600'");
    expect(brand).toContain('letterSpacing: 0.3');

    expect(header).toContain('SETTINGS_BRANDED_DISPLAY');
    expect(about).toContain('SETTINGS_BRANDED_DISPLAY');
    expect(header).toContain('allowFontScaling={false}');
    expect(about).toContain('allowFontScaling={false}');
  });

  it('reuses the Home hero tagline contract for family, weight, tracking, and gold', () => {
    const home = readSource('src/components/home/HomeHero.tsx');
    const brand = readSource('src/lib/settings/settingsBrandTypography.ts');
    const header = readSource('src/components/settings/SettingsHeader.tsx');

    expect(home).toContain("fontSize: 12");
    expect(home).toContain("fontWeight: '800'");
    expect(home).toContain('letterSpacing: 3.2');
    expect(home).toContain("textTransform: 'uppercase'");
    expect(home).toContain('color: Colors.gold');
    expect(home).toContain('Track Karl across the Bay');

    expect(brand).toContain("fontSize: 12");
    expect(brand).toContain("fontWeight: '800'");
    expect(brand).toContain('letterSpacing: 3.2');
    expect(brand).toContain("textTransform: 'uppercase'");
    expect(brand).toContain('color: Colors.gold');

    expect(header).toContain('SETTINGS_BRANDED_TAGLINE');
    expect(header).toContain('SETTINGS_COPY.subtitle');
    expect(header).toContain('numberOfLines={1}');
    expect(header).toContain('adjustsFontSizeToFit');
    expect(header).toContain('minimumFontScale={0.85}');
    expect(header).not.toContain("TRACK KARL ACROSS THE BAY");
  });
});
