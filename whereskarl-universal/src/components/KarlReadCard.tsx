import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import {
  getKarlReadDrivers,
  getKarlReadHeadline,
} from '@/lib/location/detailDisplay';

type KarlReadCardProps = {
  headline: string;
  drivers?: string[];
  isLoading?: boolean;
  isPlaceholder?: boolean;
};

export function KarlReadCard({
  headline,
  drivers = [],
  isLoading = false,
  isPlaceholder = false,
}: KarlReadCardProps) {
  return (
    <View
      style={[
        styles.card,
        isLoading && styles.loading,
        isPlaceholder && styles.placeholder,
      ]}>
      <Text style={styles.badge}>Karl read</Text>
      <Text style={styles.headline}>{headline}</Text>

      {drivers.length > 0 ? (
        <View style={styles.drivers}>
          {drivers.map((driver) => (
            <Text key={driver} style={styles.driver}>
              • {driver}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type KarlReadCardFromLocationProps = {
  karlReason?: string;
  status?: string;
  primaryDrivers?: string[];
  microclimateFactors?: string[];
  isLoading?: boolean;
};

export function KarlReadCardFromLocation({
  karlReason = '',
  status = '',
  primaryDrivers = [],
  microclimateFactors = [],
  isLoading = false,
}: KarlReadCardFromLocationProps) {
  const source = { karlReason, status, primaryDrivers, microclimateFactors };
  const headline = getKarlReadHeadline(source);
  const drivers = getKarlReadDrivers(source);
  const hasContent = Boolean(
    karlReason.trim() || status.trim() || drivers.length > 0,
  );

  return (
    <KarlReadCard
      headline={
        hasContent
          ? headline
          : 'Karl intelligence will appear here when available for this location.'
      }
      drivers={drivers}
      isLoading={isLoading}
      isPlaceholder={!hasContent}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    padding: Spacing.md,
  },
  placeholder: {
    borderStyle: 'dashed',
  },
  loading: {
    opacity: 0.72,
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  headline: {
    fontFamily: Fonts?.serif,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    color: Colors.textPrimary,
  },
  drivers: {
    gap: 4,
  },
  driver: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
