import { Colors, Fonts } from '@/constants/theme';

/**
 * Canonical branded display typography for Phase 26 Settings.
 *
 * Source of truth: approved Home hero title in
 * `src/components/home/HomeHero.tsx` (`styles.title`):
 *   fontFamily: Fonts?.serif  → iOS "Georgia" via `constants/theme.ts`
 *   fontWeight: '600'
 *   letterSpacing: 0.3
 *
 * Settings reuses that exact family/source and brand character. Home itself
 * is not imported or modified.
 */
export const SETTINGS_BRANDED_FONT_FAMILY = Fonts?.serif;

export const SETTINGS_BRANDED_DISPLAY = {
  fontFamily: Fonts?.serif,
  fontWeight: '600' as const,
  letterSpacing: 0.3,
} as const;

/**
 * Canonical branded tagline typography for the Settings subtitle.
 *
 * Source of truth: approved Home hero tagline in
 * `src/components/home/HomeHero.tsx` (`styles.tagline`):
 *   fontFamily: Fonts?.serif
 *   fontSize: 12
 *   fontWeight: '800'
 *   letterSpacing: 3.2
 *   textTransform: 'uppercase'
 *   color: Colors.brandTaglineText
 *
 * Settings reuses that exact contract. Home is not imported or modified.
 */
export const SETTINGS_BRANDED_TAGLINE = {
  fontFamily: Fonts?.serif,
  fontSize: 12,
  fontWeight: '800' as const,
  letterSpacing: 3.2,
  textTransform: 'uppercase' as const,
  color: Colors.brandTaglineText,
} as const;
