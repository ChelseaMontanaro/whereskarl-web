import { apiFetch } from "@/lib/api/client";
import { parseApiResponse } from "@/lib/schemas/parse";
import {
  karlIntelligenceResponseSchema,
  type GetKarlIntelligenceOptions,
  type KarlIntelligenceResponse,
} from "@/lib/schemas/intelligence";

export async function getKarlIntelligence(
  options?: GetKarlIntelligenceOptions,
): Promise<KarlIntelligenceResponse> {
  const searchParams = options?.locationId
    ? { locationId: options.locationId }
    : undefined;
  const data = await apiFetch<unknown>(
    "/karl-intelligence",
    undefined,
    searchParams,
  );
  return parseApiResponse(karlIntelligenceResponseSchema, data);
}
