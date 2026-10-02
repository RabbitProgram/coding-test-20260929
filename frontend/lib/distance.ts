/** メートルを、読みやすい表記にする（1000 m 未満は m、それ以上は小数 1 桁の km） */
export function formatDistance(meters: number): string {
  // 四捨五入してから判定する（999.6 m が「1000 m」と表示されないように）
  const rounded = Math.round(meters);
  if (rounded < 1000) return `${rounded} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
