"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { fetchSpotsNear } from "@/app/actions";
import { spotsInBounds, type Bounds, type LatLng } from "@/lib/bounds";
import type { Spot } from "@/lib/spots";
import { CenterAddress } from "./center-address";
import { RadiusFilter } from "./radius-filter";
import { RadiusOverlay } from "./radius-overlay";
import { SpotList } from "./spot-list";

// 高度なマーカー（AdvancedMarker）には Map ID が必要。未設定なら開発用の DEMO_MAP_ID を使う
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

// 初期表示: 東京駅
const INITIAL_CENTER = { lat: 35.681236, lng: 139.767125 };
const INITIAL_ZOOM = 10;

// InfoWindow には、描画のたびに新しい配列や JSX を渡さない。
// 値が変わるたびに吹き出しが開き直され、自動パンで、動かした地図が引き戻されるため。
const INFO_WINDOW_OFFSET: [number, number] = [0, -40];

// 距離で絞り込んでいるとき、範囲外のスポットのピン。色を差し替えるのではなく、
// フィルターで灰色にして、切り替わるときにフェードさせる
const OUT_OF_RANGE_FILTER = "grayscale(1) brightness(1.15) opacity(0.7)";

// 距離で絞り込む条件が変わってから、検索を始めるまでの待ち時間（スライダー操作中の連続検索を避ける）
const SEARCH_DELAY_MS = 250;

const searchKey = (center: LatLng, km: number) =>
  `${center.lat},${center.lng},${km}`;

export function SpotMap({ apiKey, spots }: { apiKey: string; spots: Spot[] }) {
  return (
    <APIProvider apiKey={apiKey} language="ja" region="JP">
      <SpotExplorer spots={spots} />
    </APIProvider>
  );
}

// 地図と一覧で、表示範囲・選択中のスポット・距離の絞り込みを共有する
function SpotExplorer({ spots }: { spots: Spot[] }) {
  const map = useMap();
  const [selected, setSelected] = useState<Spot | null>(null);
  // 地図の読み込み前は null（一覧は空）
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [center, setCenter] = useState<LatLng | null>(null);
  // 地図を動かしている間（止まるまで）。一覧は、止まってから更新するので、その間は最新ではない
  const [moving, setMoving] = useState(false);
  const [radius, setRadius] = useState({ enabled: false, km: 5 });
  // 距離で絞り込んだ結果。key は、どの条件の結果かを表す（spots: null は取得の失敗）
  const [nearby, setNearby] = useState<{
    key: string;
    spots: Spot[] | null;
  } | null>(null);

  // 地図の中心から指定した距離のスポットを、backend（PostGIS）で絞り込む
  useEffect(() => {
    if (!center || !radius.enabled) return;
    const key = searchKey(center, radius.km);
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchSpotsNear(center.lat, center.lng, radius.km * 1000)
        .then((found) => !cancelled && setNearby({ key, spots: found }))
        .catch(() => !cancelled && setNearby({ key, spots: null }));
    }, SEARCH_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [center, radius.enabled, radius.km]);

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

  // 距離で絞り込んでいるとき、範囲内のスポットの id。一覧と同じ、backend の検索結果を使う。
  // 結果が届くまで（読み込み中・失敗）は null で、ピンの色は変えない
  const inRangeIds = useMemo(
    () =>
      radius.enabled && nearby?.spots
        ? new Set(nearby.spots.map((spot) => spot.id))
        : null,
    [radius.enabled, nearby],
  );

  const currentKey =
    radius.enabled && center ? searchKey(center, radius.km) : null;
  const failed =
    currentKey !== null && nearby?.key === currentKey && nearby.spots === null;

  const listSpots = radius.enabled
    ? (nearby?.spots ?? [])
    : bounds
      ? spotsInBounds(spots, bounds)
      : [];
  const heading = radius.enabled
    ? `中心から ${radius.km} km 以内（${listSpots.length} 件）`
    : `表示範囲のスポット（${listSpots.length} 件）`;

  // 動かしている間、または距離で絞り込んだ結果が、今の中心の条件に追いつくまで
  const searching =
    currentKey !== null && !failed && nearby?.key !== currentKey;
  const loading = moving || searching;

  let message: string | undefined;
  if (failed) message = "スポットを取得できませんでした";
  else if (radius.enabled && !nearby) message = "読み込み中…";

  return (
    <div className="flex h-full w-full flex-col md:flex-row">
      <div className="relative min-h-0 flex-1">
        <Map
          mapId={MAP_ID}
          defaultCenter={INITIAL_CENTER}
          defaultZoom={INITIAL_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={() => setSelected(null)}
          onCameraChanged={() => setMoving(true)}
          // 移動・ズームが落ち着いたときに、表示範囲と中心を更新する
          onIdle={(e) => {
            setMoving(false);
            const nextBounds = e.map.getBounds()?.toJSON();
            const nextCenter = e.map.getCenter()?.toJSON();
            if (nextBounds) setBounds(nextBounds);
            if (nextCenter) setCenter(nextCenter);
          }}
        >
          {spots.map((spot) => {
            const outOfRange = inRangeIds !== null && !inRangeIds.has(spot.id);
            return (
              <AdvancedMarker
                key={spot.id}
                position={{ lat: spot.lat, lng: spot.lng }}
                title={spot.name}
                // 範囲内のピンが、範囲外のピンの上に重なるようにする
                zIndex={outOfRange ? 0 : 1}
                // 灰色への切り替えは、マーカー自体のフィルターで、フェードさせる
                className="transition-[filter] duration-300"
                style={{ filter: outOfRange ? OUT_OF_RANGE_FILTER : "none" }}
                onClick={() => setSelected(spot)}
              >
                <Pin />
              </AdvancedMarker>
            );
          })}

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

        <CenterAddress />

        {center && (
          <RadiusOverlay
            enabled={radius.enabled}
            initialCenter={center}
            km={radius.km}
            onKmChange={(km) => setRadius((prev) => ({ ...prev, km }))}
          />
        )}
      </div>

      <SpotList
        heading={heading}
        controls={
          <RadiusFilter
            enabled={radius.enabled}
            km={radius.km}
            onEnabledChange={(enabled) =>
              setRadius((prev) => ({ ...prev, enabled }))
            }
            onKmChange={(km) => setRadius((prev) => ({ ...prev, km }))}
          />
        }
        spots={listSpots}
        selectedId={selected?.id ?? null}
        onSelect={selectFromList}
        message={message}
        loading={loading}
      />
    </div>
  );
}
