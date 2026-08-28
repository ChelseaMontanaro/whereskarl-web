/**
 * Canonical approved "Where's Karl" logo asset — same artwork as mobile-web
 * (`apps/web/public/brand/wheres-karl-logo.png` + `@2x` variant).
 *
 * Metro resolves `@2x` / `@3x` as pixel-density suffixes, so the require
 * path must use the base filename; the @2x file lives beside it for retina.
 */
export const KARL_LOGO_IMAGE = require('../../../assets/images/brand/wheres-karl-logo.png');
