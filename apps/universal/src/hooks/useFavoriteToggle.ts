import { useCallback, useEffect, useState } from 'react';

import {
  isFavoriteLocation,
  subscribeFavoriteChanges,
  toggleFavoriteLocation,
} from '@/lib/storage/favorites';

export function useFavoriteToggle(locationId: string) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      void isFavoriteLocation(locationId).then((favorite) => {
        if (!cancelled) {
          setIsFavorite(favorite);
        }
      });
    };

    load();
    // Phase 25: this card can stay mounted (e.g. Map screen kept alive in the
    // navigation stack) while a favorite is added/removed elsewhere, such as
    // the Favorites screen. Re-read on every storage change so the heart
    // never goes stale across screens without requiring a remount.
    const unsubscribe = subscribeFavoriteChanges(load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [locationId]);

  const handleToggleFavorite = useCallback(() => {
    void toggleFavoriteLocation(locationId).then(setIsFavorite);
  }, [locationId]);

  return { isFavorite, handleToggleFavorite };
}
