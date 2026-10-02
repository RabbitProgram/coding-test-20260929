// サーバーコンポーネント専用。docker compose 内では http://backend:3001 を指す
const API_URL = process.env.API_URL ?? "http://localhost:3001";

export type Spot = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  lat: number;
  lng: number;
};

export async function fetchSpots(): Promise<Spot[]> {
  const res = await fetch(`${API_URL}/spots`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /spots responded ${res.status}`);
  return res.json() as Promise<Spot[]>;
}
