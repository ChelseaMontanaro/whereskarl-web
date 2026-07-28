import { parseApiResponse } from "@whereskarl/schemas";
import {
  bestSunshineResponseSchema,
  currentResponseSchema,
  locationsResponseSchema,
  type BestSunshineResponse,
  type CurrentResponse,
  type GetBestSunshineOptions,
  type LocationsResponse,
} from "@whereskarl/schemas";

import { apiFetch, type ApiClientConfig } from "./client";

export async function getCurrent(
  config: ApiClientConfig,
): Promise<CurrentResponse> {
  const data = await apiFetch<unknown>(config, "/current");
  return parseApiResponse(currentResponseSchema, data);
}

export async function getLocations(
  config: ApiClientConfig,
): Promise<LocationsResponse> {
  const data = await apiFetch<unknown>(config, "/locations");
  return parseApiResponse(locationsResponseSchema, data);
}

export async function getBestSunshine(
  config: ApiClientConfig,
  options?: GetBestSunshineOptions,
): Promise<BestSunshineResponse> {
  const searchParams =
    options?.lookahead === 60 ? { lookahead: options.lookahead } : undefined;
  const data = await apiFetch<unknown>(
    config,
    "/best-sunshine",
    undefined,
    searchParams,
  );
  return parseApiResponse(bestSunshineResponseSchema, data);
}
