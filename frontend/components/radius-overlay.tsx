"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { LatLng } from "@/lib/bounds";
import { metersPerPixel } from "@/lib/geo";
import { snapRadiusKm } from "@/lib/radius";

const COLOR = "#2563eb";
const LINE_WIDTH = 5;
const CASING_WIDTH = 9;
// 線の近くをつかめるように、見えない太い線を重ねて、ドラッグの当たり判定にする
const HIT_WIDTH = 28;
// 円の上端から、ラベルまでの距離
const LABEL_GAP_PX = 14;
// 地図や半径の動きが止まってから、ラベルを消し始めるまでの時間
const HIDE_DELAY_MS = 700;

type Props = {
  /** 円の中心は、常に地図（画面）の中央。緯度とズームの初期値を求めるために使う */
  initialCenter: LatLng;
  km: number;
  onKmChange: (km: number) => void;
};

// 地図の中央に、指定した距離の円を重ねて表示する。円は画面に固定され、地図を動かしても揺れない。
// 円の線をドラッグすると、半径を変えられる。距離は、動かしている間だけ円の上に表示する
export function RadiusOverlay({ initialCenter, km, onKmChange }: Props) {
  const map = useMap();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // 1 ピクセルあたりの距離が決まる、地図の緯度とズーム
  const [view, setView] = useState(() => ({
    lat: initialCenter.lat,
    zoom: map?.getZoom() ?? 10,
  }));
  // 地図や半径を動かしている間は true。tick は、動きが続いている間、消すタイマーを延ばすための印
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState(0);
  const [prevKm, setPrevKm] = useState(km);

  const bump = () => {
    setActive(true);
    setTick((t) => t + 1);
  };

  // スライダーなどで半径が変わったときも、距離を表示する
  if (km !== prevKm) {
    setPrevKm(km);
    bump();
  }

  useEffect(() => {
    if (!map) return;
    const listeners = [
      map.addListener("zoom_changed", () => {
        setView((v) => ({ ...v, zoom: map.getZoom() ?? v.zoom }));
        bump();
      }),
      map.addListener("center_changed", () => {
        setView((v) => ({ ...v, lat: map.getCenter()?.lat() ?? v.lat }));
        bump();
      }),
    ];
    return () => listeners.forEach((l) => l.remove());
  }, [map]);

  // 動きが止まったら、少し待ってから消す
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setActive(false), HIDE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [active, tick]);

  const radiusPx = (km * 1000) / metersPerPixel(view.lat, view.zoom);
  const size = (radiusPx + HIT_WIDTH) * 2;

  const resizeTo = (event: PointerEvent) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const distancePx = Math.hypot(
      event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2),
    );
    onKmChange(snapRadiusKm(distancePx * metersPerPixel(view.lat, view.zoom)));
    bump();
  };

  const startDrag = (event: PointerEvent<SVGCircleElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    bump();
  };
  const moveDrag = (event: PointerEvent) => {
    if (dragging.current) resizeTo(event);
  };
  const endDrag = (event: PointerEvent<SVGCircleElement>) => {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // 外側の要素は、操作を通さない（地図の操作を妨げない）。つかめるのは、円の線の近くだけ
  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        width={size}
        height={size}
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <circle r={radiusPx} fill={COLOR} fillOpacity={0.1} />
        <circle
          r={radiusPx}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.95}
          strokeWidth={CASING_WIDTH}
        />
        <circle
          r={radiusPx}
          fill="none"
          stroke={COLOR}
          strokeWidth={LINE_WIDTH}
        />
        <circle
          r={radiusPx}
          fill="none"
          stroke="transparent"
          strokeWidth={HIT_WIDTH}
          style={{
            pointerEvents: "stroke",
            cursor: "ew-resize",
            touchAction: "none",
          }}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      </svg>

      <div
        className={`absolute left-1/2 -translate-x-1/2 -translate-y-full rounded-lg bg-black/60 px-3.5 py-1.5 text-lg font-semibold text-white tabular-nums transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        // 円の上端から少し離す。円が画面からはみ出すときも、画面の上端に収める
        style={{ top: `max(52px, calc(50% - ${radiusPx + LABEL_GAP_PX}px))` }}
      >
        {km} km
      </div>
    </div>
  );
}
