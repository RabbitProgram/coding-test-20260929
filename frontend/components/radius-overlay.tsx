"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { useMap } from "@vis.gl/react-google-maps";
import type { LatLng } from "@/lib/bounds";
import { metersPerPixel } from "@/lib/geo";
import { snapRadiusKm } from "@/lib/radius";

const COLOR = "#2563eb";
const LINE_WIDTH = 5;
const CASING_WIDTH = 9;
const FILL_OPACITY = 0.1;
// 線の近くをつかめるように、見えない太い線を重ねて、ドラッグの当たり判定にする
const HIT_WIDTH = 28;
// 円の上端から、ラベルまでの距離
const LABEL_GAP_PX = 14;
// 地図や半径の動きが止まってから、ラベルを消し始めるまでの時間
const HIDE_DELAY_MS = 700;
// 有効・無効を切り替えるときの、円の縮む・広がる時間
const TRANSITION_MS = 400;

// 円は、地図の floatPane（マーカーより上、吹き出しは同じ層）に入れる。
// 吹き出しより下にするため、層の中では最背面に置く。
// 吹き出しの z-index は、Google Maps が画面上の位置に応じて負の値（-画面の縦位置）にするので、それより小さくする
const PANE_Z_INDEX = "-1000000";

const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;
const easeInQuad = (p: number) => p ** 2;

type Props = {
  /** true にすると、画面の外から縮んで、km の半径に収まる。false にすると、広がって画面の外へ出る */
  enabled: boolean;
  /** 円の中心は、常に地図（画面）の中央。緯度とズームの初期値を求めるために使う */
  initialCenter: LatLng;
  km: number;
  onKmChange: (km: number) => void;
};

// 地図の中央に、指定した距離の円を重ねて表示する。円は画面に固定され、地図を動かしても揺れない。
// 円の線をドラッグすると、半径を変えられる。距離は、動かしている間だけ円の上に表示する
export function RadiusOverlay({
  enabled,
  initialCenter,
  km,
  onKmChange,
}: Props) {
  const map = useMap();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // 円を入れる、地図の層の要素。層は地図と一緒に動くので、画面の中央に合わせて位置を直す
  const [pane, setPane] = useState<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // 1 ピクセルあたりの距離が決まる、地図の緯度とズーム
  const [view, setView] = useState(() => ({
    lat: initialCenter.lat,
    zoom: map?.getZoom() ?? 10,
  }));
  // 地図や半径を動かしている間は true。tick は、動きが続いている間、消すタイマーを延ばすための印
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState(0);
  const [prevKm, setPrevKm] = useState(km);
  // 円の広がり。0 は、km の半径どおり、1 は、画面の外まで広がった状態（offscreen は、そのときの半径）
  const [spread, setSpread] = useState({ amount: 1, offscreen: 0 });
  const amountRef = useRef(1);

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

  useEffect(() => {
    if (!map) return;
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.zIndex = PANE_Z_INDEX;

    const overlay = new google.maps.OverlayView();
    const place = () => {
      const center = map.getCenter();
      const point =
        center && overlay.getProjection()?.fromLatLngToDivPixel(center);
      if (!point) return;
      const { clientWidth: width, clientHeight: height } = map.getDiv();
      setFrame({
        x: point.x - width / 2,
        y: point.y - height / 2,
        width,
        height,
      });
    };
    overlay.onAdd = () => {
      overlay.getPanes()?.floatPane.appendChild(container);
      setPane(container);
    };
    overlay.draw = place;
    overlay.onRemove = () => {
      container.remove();
      setPane(null);
    };
    overlay.setMap(map);

    const listeners = [
      map.addListener("center_changed", place),
      map.addListener("bounds_changed", place),
    ];
    return () => {
      listeners.forEach((l) => l.remove());
      overlay.setMap(null);
    };
  }, [map]);

  // 動きが止まったら、少し待ってから消す
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setActive(false), HIDE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [active, tick]);

  // 有効にすると、画面の外から縮んで焦点が合うように収まり、無効にすると、広がって画面の外へ出る
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const { width, height } = wrapper.getBoundingClientRect();
    const offscreen = Math.hypot(width, height) / 2 + HIT_WIDTH;
    const from = amountRef.current;
    const to = enabled ? 0 : 1;
    const ease = enabled ? easeOutCubic : easeInQuad;
    const duration = TRANSITION_MS * Math.abs(to - from);
    const start = performance.now();

    let frame = requestAnimationFrame(function step(now) {
      const progress =
        duration === 0 ? 1 : Math.min(Math.max((now - start) / duration, 0), 1);
      const amount = from + (to - from) * ease(progress);
      amountRef.current = amount;
      setSpread({ amount, offscreen });
      if (progress < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  const targetPx = (km * 1000) / metersPerPixel(view.lat, view.zoom);
  // 画面の外まで広げるときは、半径が、画面の対角より小さくなることはない
  const radiusPx =
    targetPx +
    (Math.max(spread.offscreen, targetPx) - targetPx) * spread.amount;
  const hidden = !enabled && spread.amount >= 1;
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
  if (!pane) return null;

  return createPortal(
    <div
      ref={wrapperRef}
      className={`pointer-events-none absolute overflow-hidden ${
        hidden ? "invisible" : ""
      }`}
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        {/* 塗りも、広がるにつれて薄くして、画面全体が染まったまま、突然消えないようにする */}
        <circle
          r={radiusPx}
          fill={COLOR}
          fillOpacity={FILL_OPACITY * (1 - spread.amount)}
        />
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
            // 広がって消えていく間は、つかめないようにする
            pointerEvents: enabled ? "stroke" : "none",
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
          active && enabled ? "opacity-100" : "opacity-0"
        }`}
        // 円の上端から少し離す。円が画面からはみ出すときも、画面の上端に収める
        style={{ top: `max(52px, calc(50% - ${radiusPx + LABEL_GAP_PX}px))` }}
      >
        {km} km
      </div>
    </div>,
    pane,
  );
}
