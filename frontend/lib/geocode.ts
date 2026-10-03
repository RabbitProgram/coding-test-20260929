import { api } from "./api/client";

/** 座標の住所（丁目まで）。住所がない場所は null */
export async function fetchAddress(
  lat: number,
  lng: number,
): Promise<string | null> {
  const { data, response } = await api.GET("/geocode", {
    params: { query: { lat, lng } },
  });
  if (!data)
    throw new Error(`GET /geocode responded ${response.status}`);
  return data.address;
}
