import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import {
  METRIC_DETAILS,
  type MetricDetailKey,
} from '@/lib/home/metricDetails';

type MetricDetailSheetProps = {
  metricKey: MetricDetailKey | null;
  onClose: () => void;
};

/**
 * iOS bottom sheet for Home metric explanations (mobile-web MetricDetailSheet parity).
 */
export function MetricDetailSheet({
  metricKey,
  onClose,
}: MetricDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const detail = metricKey ? METRIC_DETAILS[metricKey] : null;

  return (
    <Modal
      visible={detail != null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close metric details"
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) + 8 },
          ]}
          accessibilityRole="summary"
          accessibilityViewIsModal>
          <View style={styles.handle} accessibilityElementsHidden />
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {detail?.title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}>
              <Text style={styles.closeGlyph}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.body}>{detail?.body}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    // Light veil only: the sheet is opaque enough to read on its own, so the
    // backdrop just needs to signal modality without hiding Home behind it.
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.88)',
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '72%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeGlyph: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.72)',
  },
  body: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.72)',
  },
});
