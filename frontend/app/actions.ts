"use server";

import { fetchAddress } from "@/lib/geocode";
import { fetchSpots, type Spot } from "@/lib/spots";

// ブラウザから呼ぶための Server Action。backend には、サーバー側から（compose 内のネットワークで）つなぐ
export async function fetchSpotsNear(
  lat: number,
  lng: number,
  radius: number,
): Promise<Spot[]> {
  return fetchSpots({ lat, lng, radius });
}

// 地図の中心の住所。Geocoding API の呼び出しは、backend が行う
export async function fetchCenterAddress(
  lat: number,
  lng: number,
): Promise<string | null> {
  return fetchAddress(lat, lng);
}
