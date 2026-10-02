import { api } from "./api/client";
import type { components } from "./api/schema";

export type Spot = components["schemas"]["SpotResponseDto"];

/** 中心から radius メートル以内のスポットを絞り込むための条件 */
export type NearCondition = { lat: number; lng: number; radius: number };

/** near を渡すと、その範囲のスポットを近い順（distance つき）で返す */
export async function fetchSpots(near?: NearCondition): Promise<Spot[]> {
  const { data, response } = await api.GET("/spots", {
    params: { query: near },
  });
  if (!data) throw new Error(`GET /spots responded ${response.status}`);
  return data;
}
