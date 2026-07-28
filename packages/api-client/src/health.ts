import {
  healthResponseSchema,
  type HealthResponse,
} from "@whereskarl/schemas";

import { apiFetch, type ApiClientConfig } from "./client";

export async function getHealth(
  config: ApiClientConfig,
): Promise<HealthResponse> {
  const data = await apiFetch<unknown>(config, "/health");
  return healthResponseSchema.parse(data);
}
