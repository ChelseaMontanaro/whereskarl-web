import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { mapGlassPanel } from '@/components/map/mapGlassPanel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  KARL_MAP_STYLE_OPTIONS,
  type KarlMapStyleId,
} from '@/lib/map/styles';

type MapLayerControlsProps = {
  mapStyle: KarlMapStyleId;
  fogLayerEnabled: boolean;
  onMapStyleChange: (styleId: KarlMapStyleId) => void;
  onFogLayerChange: (enabled: boolean) => void;
  onLocateMe?: () => void;
  onResetView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  layout?: 'desktop' | 'immersive' | 'compact';
  fogLayerSupported?: boolean;
  isPanelOpen?: boolean;
  onPanelOpenChange?: (open: boolean) => void;
};

function RadioIndicator({ checked }: { checked: boolean }) {
  return (
    <View
      style={[styles.radioOuter, checked && styles.radioOuterChecked]}
      accessibilityElementsHidden>
      {checked ? <View style={styles.radioInner} /> : null}
    </View>
  );
}

export function MapLayerControls({
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  onLocateMe,
  onResetView,
  onZoomIn,
  onZoomOut,
  layout = 'desktop',
  fogLayerSupported = Platform.OS === 'web',
  isPanelOpen,
  onPanelOpenChange,
}: MapLayerControlsProps) {
  const isImmersive = layout === 'immersive';
  const isCompact = layout === 'compact';
  const panelOpen = isImmersive || isCompact ? (isPanelOpen ?? true) : true;

  if ((isImmersive || isCompact) && !panelOpen) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open map layers"
        onPress={() => onPanelOpenChange?.(true)}
        style={({ pressed }) => [
          mapGlassPanel.panel,
          styles.layersButton,
          pressed && styles.pressed,
        ]}>
        <Text style={styles.layersButtonIcon}>☰</Text>
        {!isCompact ? <Text style={styles.layersButtonLabel}>Layers</Text> : null}
      </Pressable>
    );
  }

  return (
    <View style={[mapGlassPanel.panel, styles.panel]}>
      <View style={styles.headerRow}>
        <Text style={mapGlassPanel.eyebrow}>Layers</Text>
        {isImmersive || isCompact ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close layers panel"
            onPress={() => onPanelOpenChange?.(false)}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <Text style={styles.closeLabel}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {onZoomIn && onZoomOut ? (
        <View style={styles.zoomRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zoom in"
            onPress={onZoomIn}
            style={({ pressed }) => [styles.zoomButton, pressed && styles.pressed]}>
            <Text style={styles.zoomLabel}>+</Text>
          </Pressable>
          <View style={styles.zoomDivider} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
            onPress={onZoomOut}
            style={({ pressed }) => [styles.zoomButton, pressed && styles.pressed]}>
            <Text style={styles.zoomLabel}>−</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.section}>
        {KARL_MAP_STYLE_OPTIONS.map((option) => {
          const isSelected = mapStyle === option.id;

          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onMapStyleChange(option.id)}
              style={({ pressed }) => [
                styles.styleOption,
                isSelected && styles.styleOptionSelected,
                pressed && styles.pressed,
              ]}>
              <RadioIndicator checked={isSelected} />
              <Text
                style={[
                  styles.styleLabel,
                  isSelected && styles.styleLabelSelected,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {fogLayerSupported ? (
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Fog Layer</Text>
          <Switch
            value={fogLayerEnabled}
            onValueChange={onFogLayerChange}
            trackColor={{
              false: 'rgba(255, 255, 255, 0.1)',
              true: 'rgba(242, 163, 38, 0.3)',
            }}
            thumbColor={fogLayerEnabled ? Colors.gold : '#f4f3f4'}
            ios_backgroundColor="rgba(255, 255, 255, 0.1)"
          />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Locate me"
        onPress={onLocateMe}
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
        <Text style={styles.actionIcon}>⌖</Text>
        <Text style={styles.actionLabel}>Locate Me</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset view"
        onPress={onResetView}
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
        <Text style={styles.actionIcon}>◎</Text>
        <Text style={styles.actionLabel}>Reset View</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 200,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  layersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  layersButtonIcon: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  layersButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 4,
  },
  zoomButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  zoomLabel: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.textSecondary,
  },
  zoomDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    gap: 6,
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  styleOptionSelected: {
    borderColor: 'rgba(242, 163, 38, 0.35)',
    backgroundColor: 'rgba(242, 163, 38, 0.1)',
  },
  styleLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  styleLabelSelected: {
    color: Colors.gold,
  },
  radioOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterChecked: {
    borderColor: Colors.gold,
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  actionIcon: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.88,
  },
});
