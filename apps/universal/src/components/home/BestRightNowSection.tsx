import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { normalizeLocationId } from '@whereskarl/search';

import { Colors, Radius } from '@/constants/theme';
import {
  HOME_MOON_ICON_URI,
  HOME_SUNSHINE_ICON_URI,
} from '@/lib/home/homeConditionIcons';
import type { BestRightNowItem } from '@/lib/home/weatherDisplay';
import { buildMapHref } from '@/lib/navigation';

type BestRightNowSectionProps = {
  items: BestRightNowItem[];
  isNightPresentation?: boolean;
};

function BestRightNowRow({
  item,
  isNightPresentation,
}: {
  item: BestRightNowItem;
  isNightPresentation: boolean;
}) {
  const mapHref = normalizeLocationId(item.locationId)
    ? buildMapHref(item.locationId)
    : null;
  const iconUri = isNightPresentation
    ? HOME_MOON_ICON_URI
    : HOME_SUNSHINE_ICON_URI;

  const content = (
    <>
      <View style={styles.iconWrap}>
        <Image
          source={{ uri: iconUri }}
          style={styles.icon}
          contentFit="contain"
          accessibilityElementsHidden
        />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.locationName} allowFontScaling={false}>
          {item.locationName}
        </Text>
        <Text style={styles.detail} allowFontScaling={false}>
          {item.detail}
        </Text>
        {item.weatherMetadata && item.weatherMetadata.length > 0 ? (
          <Text
            style={styles.metadata}
            allowFontScaling={false}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}>
            {item.weatherMetadata.join(' • ')}
          </Text>
        ) : null}
      </View>
      {item.score != null ? (
        <Text style={styles.score} allowFontScaling={false}>
          {item.score}
        </Text>
      ) : null}
    </>
  );

  if (!mapHref) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.locationName} on map`}
      onPress={() => router.push(mapHref as '/map')}>
      {content}
    </Pressable>
  );
}

export function BestRightNowSection({
  items,
  isNightPresentation = false,
}: BestRightNowSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label} allowFontScaling={false}>
        Best Right Now
      </Text>
      <View style={styles.list}>
        {items.map((item) => (
          <BestRightNowRow
            key={item.locationId}
            item={item}
            isNightPresentation={isNightPresentation}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
  },
  list: {
    marginTop: 14,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
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
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  locationName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  detail: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.65)',
  },
  metadata: {
    marginTop: 4,
    // Web max-sm:text-xs / leading-snug. The one-line fit is guaranteed by
    // numberOfLines + adjustsFontSizeToFit, not by shrinking the base size.
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: 'rgba(255,255,255,0.48)',
  },
  score: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
    color: Colors.gold,
  },
});
