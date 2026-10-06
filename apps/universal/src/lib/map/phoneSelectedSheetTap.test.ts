import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('phone selected sheet tap', () => {
  const sheet = readSource('src/components/SelectedLocationPreview.tsx');
  const map = readSource('src/app/map.tsx');

  it('toggles from the grabber and expands from a collapsed body tap', () => {
    expect(sheet).toContain('onPress={handleToggleExpanded}');
    expect(sheet).toContain('onPress={handleSurfacePress}');
    expect(sheet).toContain('accessibilityRole="button"');
    expect(sheet).toContain("isExpanded ? 'Collapse details' : 'Expand details'");
    expect(sheet).toContain('accessibilityState={{ expanded: isExpanded }}');

    const surface = sheet.slice(
      sheet.indexOf('function handleSurfacePress('),
      sheet.indexOf('return (', sheet.indexOf('function handleSurfacePress(')),
    );
    expect(surface).toContain('if (isExpanded || !surfaceExpandArmed)');
    expect(sheet).toContain('{isExpanded ? (');
    expect(sheet).toContain('nestedScrollEnabled');
  });

  it('does not keep a grabber pan responder', () => {
    expect(sheet).not.toContain('PanResponder');
    expect(sheet).not.toContain('panHandlers');
    expect(sheet).not.toContain('locationCardGrabber');
    expect(map).not.toContain('PanResponder');
    expect(map).not.toContain('locationCardGrabber');
  });
});
