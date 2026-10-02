"use client";

import { useMemo, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { spotsInBounds, type Bounds } from "@/lib/bounds";
import type { Spot } from "@/lib/spots";
import { SpotList } from "./spot-list";

// 高度なマーカー（AdvancedMarker）には Map ID が必要。未設定なら開発用の DEMO_MAP_ID を使う
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

// 初期表示: 東京駅
const INITIAL_CENTER = { lat: 35.681236, lng: 139.767125 };
const INITIAL_ZOOM = 10;

// InfoWindow には、描画のたびに新しい配列や JSX を渡さない。
// 値が変わるたびに吹き出しが開き直され、自動パンで、動かした地図が引き戻されるため。
const INFO_WINDOW_OFFSET: [number, number] = [0, -40];

export function SpotMap({ apiKey, spots }: { apiKey: string; spots: Spot[] }) {
  return (
    <APIProvider apiKey={apiKey} language="ja" region="JP">
      <SpotExplorer spots={spots} />
    </APIProvider>
  );
}

// 地図と一覧で、表示範囲と選択中のスポットを共有する
function SpotExplorer({ spots }: { spots: Spot[] }) {
  const map = useMap();
  const [selected, setSelected] = useState<Spot | null>(null);
  // 地図の読み込み前は null（一覧は空）
  const [bounds, setBounds] = useState<Bounds | null>(null);

  const visibleSpots = bounds ? spotsInBounds(spots, bounds) : [];

  const infoWindowHeader = useMemo(
    () =>
      selected && (
        <span className="text-base font-bold text-zinc-900">
          {selected.name}
        </span>
      ),
    [selected],
  );

  const selectFromList = (spot: Spot) => {
    setSelected(spot);
    map?.panTo({ lat: spot.lat, lng: spot.lng });
  };

  return (
    <div className="flex h-full w-full flex-col md:flex-row">
      <div className="min-h-0 flex-1">
        <Map
          mapId={MAP_ID}
          defaultCenter={INITIAL_CENTER}
          defaultZoom={INITIAL_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={() => setSelected(null)}
          // 移動・ズームが落ち着いたときに、表示範囲を更新する
          onIdle={(e) => {
            const next = e.map.getBounds()?.toJSON();
            if (next) setBounds(next);
          }}
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
              pixelOffset={INFO_WINDOW_OFFSET}
              headerContent={infoWindowHeader}
              onCloseClick={() => setSelected(null)}
            >
              <div className="text-sm text-zinc-800">
                <p>{selected.category}</p>
                {selected.address && <p>{selected.address}</p>}
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>

      <SpotList
        spots={visibleSpots}
        selectedId={selected?.id ?? null}
        onSelect={selectFromList}
      />
    </div>
  );
}
