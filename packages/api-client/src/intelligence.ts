import { parseApiResponse } from "@whereskarl/schemas";
import {
  karlIntelligenceResponseSchema,
  type GetKarlIntelligenceOptions,
  type KarlIntelligenceResponse,
} from "@whereskarl/schemas";

import { apiFetch, type ApiClientConfig } from "./client";

export async function getKarlIntelligence(
  config: ApiClientConfig,
  options?: GetKarlIntelligenceOptions,
): Promise<KarlIntelligenceResponse> {
  const searchParams = options?.locationId
    ? { locationId: options.locationId }
    : undefined;
  const data = await apiFetch<unknown>(
    config,
    "/karl-intelligence",
    undefined,
    searchParams,
  );
  return parseApiResponse(karlIntelligenceResponseSchema, data);
}
