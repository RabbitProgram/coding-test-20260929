import { connection } from "next/server";
import { SpotMap } from "@/components/spot-map";
import { fetchSpots, type Spot } from "@/lib/spots";

export const metadata = { title: "スポットマップ" };

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <p className="max-w-md text-center text-sm text-zinc-600">
        {children}
      </p>
    </main>
  );
}

export default async function MapPage() {
  await connection(); // リクエストごとに backend からスポットを取得する

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
      <Notice>
        Google Maps の API キーが未設定です。ルートの .env に
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定して、docker compose up し直してください。
      </Notice>
    );
  }

  let spots: Spot[];
  try {
    spots = await fetchSpots();
  } catch (e) {
    return (
      <Notice>
        スポットを取得できませんでした: {e instanceof Error ? e.message : String(e)}
      </Notice>
    );
  }

  return (
    <main className="h-dvh w-full">
      <SpotMap apiKey={apiKey} spots={spots} />
    </main>
  );
}
