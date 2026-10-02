import { api } from "./api/client";
import type { components } from "./api/schema";

export type Spot = components["schemas"]["SpotResponseDto"];

export async function fetchSpots(): Promise<Spot[]> {
  const { data, response } = await api.GET("/spots");
  if (!data) throw new Error(`GET /spots responded ${response.status}`);
  return data;
}
