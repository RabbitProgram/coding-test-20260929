"use client";

import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { fetchCenterAddress } from "@/app/actions";
import { throttle } from "@/lib/throttle";
import { Spinner } from "./spinner";

// 動かしている間も、この間隔で、中心の住所を更新する（外部 API は課金対象なので、これより細かくしない）
const THROTTLE_MS = 1000;

// 地図の中心の住所を、地図に追従して表示する（逆ジオコーディング）
export function CenterAddress() {
  const map = useMap();
  const [address, setAddress] = useState<string | null>(null);
  // 動いてから、その地点の住所が届くまで。最初の取得も含む
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!map) return;

    // 返ってきた順番が前後しても、最後に要求した地点の結果だけを表示する
    let latest = 0;
    const update = throttle(() => {
      const center = map.getCenter()?.toJSON();
      if (!center) return setLoading(false);
      const request = ++latest;
      fetchCenterAddress(center.lat, center.lng)
        .then((next) => request === latest && setAddress(next))
        // 失敗したときは、古い住所を出し続けない
        .catch(() => request === latest && setAddress(null))
        .finally(() => request === latest && setLoading(false));
    }, THROTTLE_MS);

    update();
    // 動いた瞬間から、住所が届くまでの間（間引いて待っている間も）を、読み込み中にする
    const listener = map.addListener("center_changed", () => {
      setLoading(true);
      update();
    });
    return () => {
      listener.remove();
      update.cancel();
      latest++;
    };
  }, [map]);

  if (!address && !loading) return null;
  return (
    <div
      aria-busy={loading}
      className="pointer-events-none absolute bottom-8 left-1/2 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2.5 rounded-lg bg-white/90 px-4 py-2 text-lg font-semibold text-zinc-900 shadow"
    >
      {loading && <Spinner className="size-4" />}
      <span
        className={`truncate transition-opacity ${loading ? "opacity-50" : ""}`}
      >
        {address ?? "住所を取得中…"}
      </span>
    </div>
  );
}
