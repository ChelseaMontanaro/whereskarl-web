import { Image } from 'expo-image';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  CLEAREST_SPOT_GAUGE_CENTER_X,
  CLEAREST_SPOT_GAUGE_CENTER_Y,
  CLEAREST_SPOT_GAUGE_VIEWBOX,
  clearestSpotGaugeActiveArcPath,
  clearestSpotGaugeArcEnd,
  clearestSpotGaugeArcStart,
  clearestSpotGaugeAriaLabel,
  clearestSpotGaugeInactiveArcPath,
  clearestSpotGaugeMarkerPoint,
  clearestSpotGaugeMarkerRotationDegrees,
} from '@/lib/home/clearestSpotGauge';

type ClearestSpotGaugeProps = {
  score: number;
};

/** Phase 23 parity with web ClearestSpotGauge; Phase 23.1 will polish visuals. */
export function ClearestSpotGauge({ score }: ClearestSpotGaugeProps) {
  const uri = useMemo(() => buildGaugeDataUri(score), [score]);

  return (
    <View
      style={styles.root}
      accessible
      accessibilityRole="image"
      accessibilityLabel={clearestSpotGaugeAriaLabel(score)}>
      <Image
        source={{ uri }}
        style={styles.image}
        contentFit="contain"
        accessibilityElementsHidden
      />
    </View>
  );
}

function buildGaugeDataUri(score: number): string {
  const marker = clearestSpotGaugeMarkerPoint(score);
  const activeArcPath = clearestSpotGaugeActiveArcPath(score);
  const inactiveArcPath = clearestSpotGaugeInactiveArcPath(score);
  const markerRotation = clearestSpotGaugeMarkerRotationDegrees(score);
  const arcStart = clearestSpotGaugeArcStart();
  const arcEnd = clearestSpotGaugeArcEnd();
  const labelY = 51;
  const presentationScaleX = 1.18;
  const presentationScaleY = 0.44;
  const presentationTranslateY = -2;
  const transform = `translate(${CLEAREST_SPOT_GAUGE_CENTER_X} ${CLEAREST_SPOT_GAUGE_CENTER_Y}) scale(${presentationScaleX} ${presentationScaleY}) translate(${-CLEAREST_SPOT_GAUGE_CENTER_X} ${-CLEAREST_SPOT_GAUGE_CENTER_Y}) translate(0 ${presentationTranslateY})`;
  const labelX = (x: number) =>
    CLEAREST_SPOT_GAUGE_CENTER_X +
    (x - CLEAREST_SPOT_GAUGE_CENTER_X) * presentationScaleX;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 27 ${CLEAREST_SPOT_GAUGE_VIEWBOX.width} 26" preserveAspectRatio="xMidYMax meet">
  <defs>
    <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="${arcStart.x}" y1="${CLEAREST_SPOT_GAUGE_CENTER_Y}" x2="${arcEnd.x}" y2="${CLEAREST_SPOT_GAUGE_CENTER_Y - CLEAREST_SPOT_GAUGE_VIEWBOX.height * 0.45}">
      <stop offset="0%" stop-color="#4A86B5" />
      <stop offset="100%" stop-color="#9AD4FF" />
    </linearGradient>
  </defs>
  <g transform="${transform}">
    ${
      inactiveArcPath
        ? `<path d="${inactiveArcPath}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="5" stroke-linecap="round" />`
        : ''
    }
    ${
      activeArcPath
        ? `<path d="${activeArcPath}" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round" />`
        : ''
    }
    <line x1="${CLEAREST_SPOT_GAUGE_CENTER_X}" y1="${CLEAREST_SPOT_GAUGE_CENTER_Y}" x2="${marker.x}" y2="${marker.y}" stroke="white" stroke-width="1.25" stroke-linecap="round" />
    <circle cx="${CLEAREST_SPOT_GAUGE_CENTER_X}" cy="${CLEAREST_SPOT_GAUGE_CENTER_Y}" r="2.85" fill="white" />
    <circle cx="${CLEAREST_SPOT_GAUGE_CENTER_X}" cy="${CLEAREST_SPOT_GAUGE_CENTER_Y}" r="1.15" fill="#8EC8F0" />
    <rect x="${marker.x - 3.25}" y="${marker.y - 2}" width="6.5" height="4" rx="2" fill="white" transform="rotate(${markerRotation} ${marker.x} ${marker.y})" />
  </g>
  <text x="${labelX(arcStart.x)}" y="${labelY}" text-anchor="middle" fill="rgba(255,255,255,0.38)" font-size="4" font-weight="700" letter-spacing="0.08em">LOW</text>
  <text x="${labelX(arcEnd.x)}" y="${labelY}" text-anchor="middle" fill="rgba(255,255,255,0.38)" font-size="4" font-weight="700" letter-spacing="0.08em">BEST</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const styles = StyleSheet.create({
  root: {
    marginTop: 10,
    width: '100%',
    height: 40,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
