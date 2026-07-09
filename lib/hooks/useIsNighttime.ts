"use client";

import { useEffect, useState } from "react";

import { isNighttime } from "@/lib/home/weatherDisplay";

function getCurrentIsNighttime(): boolean {
  return isNighttime(new Date().getHours());
}

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
