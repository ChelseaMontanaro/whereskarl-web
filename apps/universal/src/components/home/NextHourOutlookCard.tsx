import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { HOME_NEXT_HOUR_ICON_URI } from '@/lib/home/homeConditionIcons';

type NextHourOutlookCardProps = {
  summary: string | null;
  confidenceLabel: string | null;
  isLoading: boolean;
};

export function NextHourOutlookCard({
  summary,
  confidenceLabel,
  isLoading,
}: NextHourOutlookCardProps) {
  // Karl's pin can land on a location whose hourly prediction is unavailable
  // (degraded pins report `predictionConfidenceLabel: "Unavailable"`). This card
  // used to return null there, so Future Outlook vanished from Home entirely.
  // The section always renders; only its body degrades.
  const hasSummary = Boolean(summary);
  const trimmedConfidence = confidenceLabel?.trim();
  const showConfidence = Boolean(
    hasSummary &&
      trimmedConfidence &&
      trimmedConfidence.toLowerCase() !== 'unavailable',
  );

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Image
          source={{ uri: HOME_NEXT_HOUR_ICON_URI }}
          style={styles.icon}
          contentFit="contain"
          accessibilityElementsHidden
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label} allowFontScaling={false}>
          Future Outlook
        </Text>
        {isLoading ? (
          <Text style={styles.loading} allowFontScaling={false}>
            Checking the future outlook…
          </Text>
        ) : hasSummary ? (
          <>
            <Text style={styles.summary} allowFontScaling={false}>
              {summary}
            </Text>
            {showConfidence ? (
              <Text style={styles.confidence} allowFontScaling={false}>
                {trimmedConfidence} confidence
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.loading} allowFontScaling={false}>
            No hourly outlook available for Karl’s spot right now.
          </Text>
        )}
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
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    // Web informational icon slot: h-8 w-8.
    width: 32,
    height: 32,
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
  loading: {
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
  },
  summary: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.75)',
  },
  confidence: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
});
