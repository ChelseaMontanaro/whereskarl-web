import { apiFetch } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/schemas/parse";
import {
  bestSunshineResponseSchema,
  currentResponseSchema,
  locationsResponseSchema,
  type BestSunshineResponse,
  type CurrentResponse,
  type GetBestSunshineOptions,
  type LocationsResponse,
} from "@/lib/schemas/weather";

export async function getCurrent(): Promise<CurrentResponse> {
  const data = await apiFetch<unknown>("/current");
  return parseApiResponse(currentResponseSchema, data);
}

export async function getLocations(): Promise<LocationsResponse> {
  const data = await apiFetch<unknown>("/locations");
  return parseApiResponse(locationsResponseSchema, data);
}

export async function getBestSunshine(
  options?: GetBestSunshineOptions,
): Promise<BestSunshineResponse> {
  const searchParams =
    options?.lookahead === 60 ? { lookahead: options.lookahead } : undefined;
  const data = await apiFetch<unknown>("/best-sunshine", undefined, searchParams);
  return parseApiResponse(bestSunshineResponseSchema, data);
}
