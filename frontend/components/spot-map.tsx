"use client";

import { useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import type { Spot } from "@/lib/spots";

// 高度なマーカー（AdvancedMarker）には Map ID が必要。未設定なら開発用の DEMO_MAP_ID を使う
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

function boundsOf(spots: Spot[]) {
  const lats = spots.map((s) => s.lat);
  const lngs = spots.map((s) => s.lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
    padding: 48,
  };
}

export function SpotMap({ apiKey, spots }: { apiKey: string; spots: Spot[] }) {
  const [selected, setSelected] = useState<Spot | null>(null);

  return (
    <APIProvider apiKey={apiKey} language="ja" region="JP">
      <Map
        mapId={MAP_ID}
        // スポットが全部収まる範囲を初期表示にする
        defaultBounds={spots.length > 0 ? boundsOf(spots) : undefined}
        defaultCenter={spots.length > 0 ? undefined : { lat: 35.68, lng: 139.76 }}
        defaultZoom={spots.length > 0 ? undefined : 10}
        gestureHandling="greedy"
        disableDefaultUI={false}
        onClick={() => setSelected(null)}
      >
        {spots.map((spot) => (
          <AdvancedMarker
            key={spot.id}
            position={{ lat: spot.lat, lng: spot.lng }}
            title={spot.name}
            onClick={() => setSelected(spot)}
          >
            <Pin />
          </AdvancedMarker>
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            pixelOffset={[0, -40]}
            headerContent={
              <span className="text-base font-bold text-zinc-900">
                {selected.name}
              </span>
            }
            onCloseClick={() => setSelected(null)}
          >
            <div className="text-sm text-zinc-800">
              <p>{selected.category}</p>
              {selected.address && <p>{selected.address}</p>}
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
