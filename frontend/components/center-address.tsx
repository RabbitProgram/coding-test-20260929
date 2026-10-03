"use client";

import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { fetchCenterAddress } from "@/app/actions";
import { throttle } from "@/lib/throttle";

// 動かしている間も、この間隔で、中心の住所を更新する（外部 API は課金対象なので、これより細かくしない）
const THROTTLE_MS = 1000;

// 地図の中心の住所を、地図に追従して表示する（逆ジオコーディング）
export function CenterAddress() {
  const map = useMap();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!map) return;

    // 返ってきた順番が前後しても、最後に要求した地点の結果だけを表示する
    let latest = 0;
    const update = throttle(() => {
      const center = map.getCenter()?.toJSON();
      if (!center) return;
      const request = ++latest;
      fetchCenterAddress(center.lat, center.lng)
        .then((next) => request === latest && setAddress(next))
        // 失敗したときは、古い住所を出し続けない
        .catch(() => request === latest && setAddress(null));
    }, THROTTLE_MS);

    update();
    const listener = map.addListener("center_changed", update);
    return () => {
      listener.remove();
      update.cancel();
      latest++;
    };
  }, [map]);

  if (!address) return null;
  return (
    <div className="pointer-events-none absolute bottom-8 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 truncate rounded-lg bg-white/90 px-4 py-2 text-lg font-semibold text-zinc-900 shadow">
      {address}
    </div>
  );
}
