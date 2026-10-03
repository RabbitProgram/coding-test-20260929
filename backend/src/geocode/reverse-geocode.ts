// 課金対象の API なので、近い地点は、同じ結果を使い回す。
// 小数第 3 位（約 100 m）で丸めた格子を、1 つの地点として扱う。
const GRID_DIGITS = 3;

export function snapToGrid(lat: number, lng: number) {
  return {
    lat: Number(lat.toFixed(GRID_DIGITS)),
    lng: Number(lng.toFixed(GRID_DIGITS)),
  };
}

export const cacheKey = (lat: number, lng: number) =>
  `geocode:reverse:${lat},${lng}`;

export interface GeocodeResult {
  formatted_address: string;
  types: string[];
}

// 表示する住所の細かさ。細かい順に探し、最初に見つかったものを使う（番地・建物名は出さない）。
// 場所によって返ってくる粒度が違うので（郊外は丁目がないなど）、順番に探す
const GRANULARITY = [
  'sublocality_level_3', // 丁目
  'sublocality_level_2', // 町名
  'sublocality_level_1', // 区
  'locality', // 市
  'administrative_area_level_1', // 都道府県
];

/** 逆ジオコーディングの結果から、表示する住所を選ぶ。国名と郵便番号は省く */
export function pickAddress(results: GeocodeResult[]): string | null {
  for (const type of GRANULARITY) {
    const result = results.find((r) => r.types.includes(type));
    if (result) return tidy(result.formatted_address);
  }
  return null;
}

const tidy = (address: string) =>
  address.replace(/^日本、\s*/, '').replace(/^〒\d{3}-\d{4}\s*/, '') || null;
