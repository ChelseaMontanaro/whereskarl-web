"use client";

import { setRuntimeApiBaseUrl } from "@/lib/env/publicEnv";
import { useEffect, type ReactNode } from "react";

type PublicEnvProviderProps = {
  apiBaseUrl?: string;
  children: ReactNode;
};

export function PublicEnvProvider({
  apiBaseUrl,
  children,
}: PublicEnvProviderProps) {
  useEffect(() => {
    setRuntimeApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  return children;
}
