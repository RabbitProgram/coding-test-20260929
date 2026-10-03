"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { formatDistance } from "@/lib/distance";
import type { Spot } from "@/lib/spots";
import { Spinner } from "./spinner";

type Props = {
  heading: string;
  /** 見出しの下に表示する操作部品（絞り込みのスライダーなど） */
  controls?: ReactNode;
  spots: Spot[];
  selectedId: string | null;
  onSelect: (spot: Spot) => void;
  /** 一覧の代わりに表示するメッセージ（読み込み中・エラーなど） */
  message?: string;
  /** 地図を動かしていて、一覧が最新ではないとき（前の結果を薄く表示して、見出しにスピナーを出す） */
  loading?: boolean;
};

export function SpotList({
  heading,
  controls,
  spots,
  selectedId,
  onSelect,
  message,
  loading = false,
}: Props) {
  const selectedRef = useRef<HTMLLIElement>(null);

  // 地図上のマーカーで選ばれたときも、一覧の該当行が見えるようにする
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  const emptyMessage =
    message ?? (spots.length === 0 ? "この範囲にスポットはありません" : null);

  return (
    <aside className="flex h-[40dvh] shrink-0 flex-col border-t border-zinc-200 bg-white text-zinc-900 md:order-first md:h-full md:w-96 md:border-r md:border-t-0">
      <h1 className="px-4 pt-4 pb-2 text-3xl font-extrabold">
        位置情報探索アプリ
      </h1>
      <h2
        aria-busy={loading}
        className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 text-sm font-semibold"
      >
        {heading}
        {loading && <Spinner className="size-3.5" />}
      </h2>
      {controls}

      {emptyMessage ? (
        <p className="px-4 py-6 text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <ul
          className={`min-h-0 flex-1 divide-y divide-zinc-200 overflow-y-auto transition-opacity ${loading ? "opacity-50" : ""}`}
        >
          {spots.map((spot) => {
            const selected = spot.id === selectedId;
            return (
              <li key={spot.id} ref={selected ? selectedRef : undefined}>
                <button
                  type="button"
                  onClick={() => onSelect(spot)}
                  aria-current={selected}
                  className={`w-full cursor-pointer px-4 py-3 text-left ${
                    selected ? "bg-blue-50" : "hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-medium">{spot.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {spot.category}
                    {spot.address && ` ・ ${spot.address}`}
                    {spot.distance !== undefined &&
                      ` ・ ${formatDistance(spot.distance)}`}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
