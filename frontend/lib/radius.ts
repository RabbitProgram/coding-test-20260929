/** 距離で絞り込むときの半径の範囲（km）と刻み */
export const RADIUS_MIN_KM = 1;
export const RADIUS_MAX_KM = 300;
export const RADIUS_STEP_KM = 1;

/** 半径（メートル）を、刻み（1 km。整数）に丸め、範囲内に収めた km にする */
export function snapRadiusKm(meters: number): number {
  const snapped = Math.round(meters / 1000 / RADIUS_STEP_KM) * RADIUS_STEP_KM;
  return Math.min(RADIUS_MAX_KM, Math.max(RADIUS_MIN_KM, snapped));
}
