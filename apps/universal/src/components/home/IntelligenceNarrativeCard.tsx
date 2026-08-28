import { StyleSheet, Text, View } from 'react-native';

import { KarlLogo } from '@/components/brand/KarlLogo';
import { Colors, Radius } from '@/constants/theme';
import type { KarlReadPresentation } from '@/lib/home/weatherDisplay';
import type { KarlIntelligenceResponse } from '@whereskarl/schemas';

type IntelligenceNarrativeCardProps = {
  intelligence: KarlIntelligenceResponse | null;
  karlReadPresentation?: KarlReadPresentation | null;
  isLoading: boolean;
};

export function IntelligenceNarrativeCard({
  intelligence,
  karlReadPresentation,
  isLoading,
}: IntelligenceNarrativeCardProps) {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.icon}>
          <KarlLogo size={28} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>Karl&apos;s Read</Text>
          <Text style={styles.loadingHeadline}>Reading Karl intelligence…</Text>
        </View>
      </View>
    );
  }

  if (!intelligence) {
    return null;
  }

  const confidenceLabel =
    intelligence.narrative.confidenceLabel.toLowerCase() === 'unavailable'
      ? null
      : intelligence.narrative.confidenceLabel;
  const headline =
    karlReadPresentation?.headline ?? intelligence.narrative.headline;
  const summary =
    karlReadPresentation?.summary ?? intelligence.narrative.summary;

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <KarlLogo size={28} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>Karl&apos;s Read</Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.summary}>{summary}</Text>
        {confidenceLabel ? (
          <Text style={styles.confidence}>
            {confidenceLabel} confidence
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  icon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.42)',
  },
  loadingHeadline: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  headline: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: '600',
    lineHeight: 26,
    color: Colors.textPrimary,
  },
  summary: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.7)',
  },
  confidence: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
});
