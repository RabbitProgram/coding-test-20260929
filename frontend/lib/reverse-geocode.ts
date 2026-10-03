// 表示する住所の細かさ
const GRANULARITY = [
  "sublocality_level_3", // 丁目
  "sublocality_level_2", // 町名
  "sublocality_level_1", // 区
  "locality", // 市
  "administrative_area_level_1", // 都道府県
];

// 逆ジオコーディングの結果から、表示する住所を選択
export function pickAddress(
  results: { formatted_address: string; types: string[] }[],
): string | null {
  for (const type of GRANULARITY) {
    const result = results.find((r) => r.types.includes(type));
    if (result) return tidy(result.formatted_address);
  }
  return null;
}

const tidy = (address: string) =>
  address.replace(/^日本、\s*/, "").replace(/^〒\d{3}-\d{4}\s*/, "") || null;
