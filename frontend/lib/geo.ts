/** Web メルカトル（Google Maps と同じ投影）で、ズームが 0 のときの、赤道での 1 ピクセルあたりの距離（メートル） */
const METERS_PER_PIXEL_AT_ZOOM_0 = 156_543.03392;

/** 画面上の 1 ピクセルが表す距離（メートル）。緯度とズームで決まる */
export function metersPerPixel(lat: number, zoom: number): number {
  return (
    (METERS_PER_PIXEL_AT_ZOOM_0 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom
  );
}
