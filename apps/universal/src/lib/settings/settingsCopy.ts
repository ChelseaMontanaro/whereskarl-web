/**
 * Phase 26 — approved Settings copy inventory.
 *
 * These strings are the product contract for the Settings screen. Tests assert
 * this inventory is present and that Favorites management and Home Location
 * are not surfaced here.
 */
export const SETTINGS_COPY = {
  title: 'Settings',
  subtitle: 'Make Karl work your way.',
  preferencesEyebrow: 'Preferences',
  temperatureTitle: 'Temperature Unit',
  temperatureSupport:
    'Choose how the temperature is displayed.',
  comingSoon: 'Coming Soon',
  fahrenheit: '°F',
  celsius: '°C',
  aboutEyebrow: 'About & Support',
  aboutTitle: "About Where's Karl",
  aboutSupport: 'Our story, the mission, and app details.',
  aboutSheetTitle: 'Meet Karl.',
  helpTitle: 'Help & Support',
  helpSupport: 'Get help or send us a message.',
  privacyTitle: 'Privacy Policy',
  privacySupport: 'How we protect your information.',
  productName: "Where's Karl",
  footerTagline: 'Made for brighter days around the Bay.',
  aboutClose: 'Close',
} as const;

/**
 * Approved Phase 26 About body. Intentionally warm and product-specific —
 * not additional marketing claims, legal copy, or a new About route.
 */
export const SETTINGS_ABOUT_PARAGRAPHS = [
  "Karl the Fog has a habit of showing up whenever he feels like it. Where's Karl helps you see where he's hanging out — and where the sunshine is winning.",
  'From San Francisco to the North, East and South Bay, explore live conditions across the Bay Area and find your brightest spot.',
] as const;
