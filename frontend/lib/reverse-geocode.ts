// 逆ジオコーディングの結果から、表示する住所を選ぶ。
// 先頭が Plus Code のこともあるので、住所の形をしたものを優先し、国名と郵便番号は省く
export function pickAddress(
  results: { formatted_address: string; types: string[] }[],
): string | null {
  const result =
    results.find((r) => !r.types.includes("plus_code")) ?? results[0];
  if (!result) return null;
  return (
    result.formatted_address
      .replace(/^日本、\s*/, "")
      .replace(/^〒\d{3}-\d{4}\s*/, "") || null
  );
}
