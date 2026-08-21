import { useCallback, useEffect, useState } from 'react';

import {
  isFavoriteLocation,
  toggleFavoriteLocation,
} from '@/lib/storage/favorites';

export function useFavoriteToggle(locationId: string) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void isFavoriteLocation(locationId).then((favorite) => {
      if (!cancelled) {
        setIsFavorite(favorite);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [locationId]);

  const handleToggleFavorite = useCallback(() => {
    void toggleFavoriteLocation(locationId).then(setIsFavorite);
  }, [locationId]);

  return { isFavorite, handleToggleFavorite };
}
