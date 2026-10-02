"use client";

import { useEffect, useRef } from "react";
import type { Spot } from "@/lib/spots";

type Props = {
  spots: Spot[];
  selectedId: string | null;
  onSelect: (spot: Spot) => void;
};

export function SpotList({ spots, selectedId, onSelect }: Props) {
  const selectedRef = useRef<HTMLLIElement>(null);

  // 地図上のマーカーで選ばれたときも、一覧の該当行が見えるようにする
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  return (
    <aside className="flex h-[40dvh] shrink-0 flex-col border-t border-zinc-200 bg-white text-zinc-900 md:order-first md:h-full md:w-96 md:border-r md:border-t-0">
      <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold">
        表示範囲のスポット（{spots.length} 件）
      </h2>

      {spots.length === 0 ? (
        <p className="px-4 py-6 text-sm text-zinc-500">
          この範囲にスポットはありません
        </p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-zinc-200 overflow-y-auto">
          {spots.map((spot) => {
            const selected = spot.id === selectedId;
            return (
              <li key={spot.id} ref={selected ? selectedRef : undefined}>
                <button
                  type="button"
                  onClick={() => onSelect(spot)}
                  aria-current={selected}
                  className={`w-full cursor-pointer px-4 py-3 text-left ${
                    selected
                      ? "bg-blue-50"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-medium">{spot.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {spot.category}
                    {spot.address && ` ・ ${spot.address}`}
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
