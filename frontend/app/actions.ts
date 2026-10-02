"use server";

import { fetchSpots, type Spot } from "@/lib/spots";

// ブラウザから呼ぶための Server Action。backend には、サーバー側から（compose 内のネットワークで）つなぐ
export async function fetchSpotsNear(
  lat: number,
  lng: number,
  radius: number,
): Promise<Spot[]> {
  return fetchSpots({ lat, lng, radius });
}
