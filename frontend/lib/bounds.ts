export type Bounds = { north: number; south: number; east: number; west: number };
export type LatLng = { lat: number; lng: number };

export function isInBounds(point: LatLng, bounds: Bounds): boolean {
  if (point.lat > bounds.north || point.lat < bounds.south) return false;

  // 日付変更線をまたぐ範囲（west > east）は、経度が west 以上、または east 以下
  return bounds.west <= bounds.east
    ? point.lng >= bounds.west && point.lng <= bounds.east
    : point.lng >= bounds.west || point.lng <= bounds.east;
}

export function spotsInBounds<T extends LatLng>(
  spots: T[],
  bounds: Bounds,
): T[] {
  return spots.filter((spot) => isInBounds(spot, bounds));
}
