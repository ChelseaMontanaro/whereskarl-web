import { useEffect, useState } from 'react';

import { getCurrentIsNighttime } from '@/lib/map/timeOfDay';

export function useIsNighttime(): boolean {
  const [isNight, setIsNight] = useState(getCurrentIsNighttime);

  useEffect(() => {
    const sync = () => setIsNight(getCurrentIsNighttime());
    sync();

    const intervalId = setInterval(sync, 60_000);
    return () => clearInterval(intervalId);
  }, []);

  return isNight;
}
