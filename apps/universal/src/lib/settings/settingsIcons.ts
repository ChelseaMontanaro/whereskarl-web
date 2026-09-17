/**
 * Settings-local row glyphs. These are UI chrome, not brand marks.
 * The Karl fog character is never drawn here — footer / About use `KarlLogo`.
 */
export type SettingsRowIconKind =
  | 'temperature'
  | 'about'
  | 'help'
  | 'privacy';

function dataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function strokeSvg(path: string, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

const PATHS: Record<SettingsRowIconKind, string> = {
  temperature:
    '<path d="M10 5.2v9.1a3.4 3.4 0 1 0 4 0V5.2a2 2 0 1 0-4 0Z"/><path d="M12 14.6v2.2"/>',
  about:
    '<circle cx="12" cy="12" r="8.2"/><path d="M12 11.2V16"/><path d="M12 8.15v.1"/>',
  help: '<circle cx="12" cy="12" r="8.2"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.25c-.7.4-1.2.9-1.2 1.75"/><path d="M12 16.4v.2"/>',
  privacy:
    '<rect x="7" y="11" width="10" height="8" rx="1.6"/><path d="M9 11V8.4a3 3 0 0 1 6 0V11"/>',
};

export function settingsRowIconDataUri(
  kind: SettingsRowIconKind,
  color: string,
): string {
  return dataUri(strokeSvg(PATHS[kind], color));
}
