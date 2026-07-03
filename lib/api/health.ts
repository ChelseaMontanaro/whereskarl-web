import { apiFetch } from "@/lib/api/client";
import {
  healthResponseSchema,
  type HealthResponse,
} from "@/lib/schemas/health";

export async function getHealth(): Promise<HealthResponse> {
  const data = await apiFetch<unknown>("/health");
  return healthResponseSchema.parse(data);
}
