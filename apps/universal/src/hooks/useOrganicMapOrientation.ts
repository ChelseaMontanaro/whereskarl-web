import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';

import type { KarlMapHandle } from '@/components/KarlMap/KarlMap.types';
import {
  readForegroundLocationFix,
  readForegroundPermissionStatus,
  requestForegroundPermission,
} from '@/lib/map/organicMapDeviceLocation';
import {
  resolveOrganicCatalogSelection,
  shouldStartOrganicMapResolution,
  type CatalogPoint,
} from '@/lib/map/organicMapEntry';

type UseOrganicMapOrientationInput = {
  entry: string | null;
  orient: string | null;
  explicitSelectedId: string | null;
  locations: readonly CatalogPoint[];
  isLoading: boolean;
  isPhone: boolean;
  mapRef: RefObject<KarlMapHandle | null>;
  cancelSignalRef: MutableRefObject<number>;
  onClearSelection: () => void;
  onSelectLocation: (locationId: string) => void;
};

/**
 * Runs after the Map has painted. Permission and the location fix never
 * block the first all-Bay frame.
 */
export function useOrganicMapOrientation({
  entry,
  orient,
  explicitSelectedId,
  locations,
  isLoading,
  isPhone,
  mapRef,
  cancelSignalRef,
  onClearSelection,
  onSelectLocation,
}: UseOrganicMapOrientationInput): void {
  const lastCompletedOrientRef = useRef<string | null>(null);
  const isPhoneRef = useRef(isPhone);
  const locationsRef = useRef(locations);
  isPhoneRef.current = isPhone;
  locationsRef.current = locations;

  useEffect(() => {
    if (
      !shouldStartOrganicMapResolution({
        entry,
        orient,
        lastProcessedOrient: lastCompletedOrientRef.current,
        explicitSelectedId,
      })
    ) {
      return;
    }

    const snapshot = locationsRef.current;
    if (snapshot.length === 0) {
      if (isLoading) {
        return;
      }

      lastCompletedOrientRef.current = orient;
      onClearSelection();
      return;
    }

    const request = cancelSignalRef.current + 1;
    cancelSignalRef.current = request;
    let active = true;
    onClearSelection();

    void resolveOrganicCatalogSelection({
      locations: snapshot,
      readPermission: readForegroundPermissionStatus,
      requestPermission: requestForegroundPermission,
      readFix: readForegroundLocationFix,
    })
      .then((result) => {
        if (!active || cancelSignalRef.current !== request) {
          return;
        }

        lastCompletedOrientRef.current = orient;
        if (result.type !== 'select') {
          return;
        }

        onSelectLocation(result.locationId);
        if (isPhoneRef.current) {
          mapRef.current?.focusLocation(result.latitude, result.longitude);
        }
      })
      .catch(() => {
        if (active && cancelSignalRef.current === request) {
          lastCompletedOrientRef.current = orient;
        }
      });

    return () => {
      active = false;
    };
  }, [
    cancelSignalRef,
    entry,
    explicitSelectedId,
    isLoading,
    locations.length,
    mapRef,
    onClearSelection,
    onSelectLocation,
    orient,
  ]);
}
