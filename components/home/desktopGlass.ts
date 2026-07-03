export const desktopGlassCardClass =
  "rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

export const desktopMistIconClass =
  "border-white/16 bg-white/8 text-white/92";

export const desktopGoldIconClass =
  "border-karl-gold/28 bg-karl-gold/12 text-karl-gold";

export function clearestSpotDesktopLabel(isNightPresentation: boolean): string {
  return isNightPresentation ? "Clearest Spot" : "Clearest Spot";
}
