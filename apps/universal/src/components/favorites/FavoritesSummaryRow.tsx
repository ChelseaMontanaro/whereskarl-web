import { StyleSheet, Text, View } from 'react-native';

import {
  FAVORITES_GLASS_BORDER,
  FAVORITES_GLASS_FILL,
} from '@/components/favorites/favoritesChrome';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { FavoritesSummary } from '@/lib/favorites/favoritesDisplay';

type FavoritesSummaryRowProps = {
  summary: FavoritesSummary;
};

function SummaryMetricCard({
  value,
  icon,
  title,
}: {
  value: string;
  icon: string;
  title: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text
        style={styles.cardTitle}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}>
        {title}
      </Text>
      <Text style={styles.cardIcon} accessibilityElementsHidden>
        {icon}
      </Text>
    </View>
  );
}

export function FavoritesSummaryRow({ summary }: FavoritesSummaryRowProps) {
  return (
    <View style={styles.row}>
      <SummaryMetricCard
        value={String(summary.total)}
        icon="♡"
        title="Favorites"
      />
      <SummaryMetricCard
        value={String(summary.clearCount)}
        icon="☀"
        title="Sunny & Clear"
      />
      <SummaryMetricCard
        value={String(summary.karlCount)}
        icon="☁"
        title="Karl"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: FAVORITES_GLASS_BORDER,
    backgroundColor: FAVORITES_GLASS_FILL,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.62)',
  },
  cardIcon: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.62)',
  },
});
