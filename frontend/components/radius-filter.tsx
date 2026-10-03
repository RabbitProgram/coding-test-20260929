"use client";

import { RADIUS_MAX_KM, RADIUS_MIN_KM, RADIUS_STEP_KM } from "@/lib/radius";

type Props = {
  enabled: boolean;
  km: number;
  onEnabledChange: (enabled: boolean) => void;
  onKmChange: (km: number) => void;
};

export function RadiusFilter({
  enabled,
  km,
  onEnabledChange,
  onKmChange,
}: Props) {
  return (
    <div className="border-b border-zinc-200 px-4 py-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="cursor-pointer"
        />
        半径検索
      </label>

      <div
        className={`mt-2 flex items-center gap-3 transition-opacity duration-300 ${
          enabled ? "" : "opacity-50"
        }`}
      >
        <input
          type="range"
          aria-label="中心からの距離（km）"
          min={RADIUS_MIN_KM}
          max={RADIUS_MAX_KM}
          step={RADIUS_STEP_KM}
          value={km}
          disabled={!enabled}
          onChange={(e) => onKmChange(Number(e.target.value))}
          className="flex-1 cursor-pointer disabled:cursor-not-allowed"
        />
        <output className="w-14 text-right text-sm tabular-nums">
          {km} km
        </output>
      </div>
    </div>
  );
}
