/**
 * TEMPORARY — remove with the phone-portrait camera debug overlay.
 *
 * Enable in local dev only:
 *   NEXT_PUBLIC_DEBUG_PHONE_PORTRAIT_CAMERA=true
 *
 * Never active in production builds.
 */
export const PHONE_PORTRAIT_CAMERA_DEBUG_ENABLED =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEBUG_PHONE_PORTRAIT_CAMERA === "true";
