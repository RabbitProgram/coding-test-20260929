import { parse } from 'csv-parse/sync';
import type { Point } from 'geojson';

interface SeedRow {
  name: string;
  category: string;
  lat: string;
  long: string;
  address: string;
}

export interface SpotSeed {
  name: string;
  category: string;
  address: string | null;
  location: Point;
}

function toSpotSeed(row: SeedRow, line: number): SpotSeed {
  const lat = Number(row.lat);
  const lng = Number(row.long);
  if (
    !row.name ||
    !row.category ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    throw new Error(`seed.csv ${line} 行目が不正です: ${JSON.stringify(row)}`);
  }
  return {
    name: row.name,
    category: row.category,
    address: row.address || null,
    location: { type: 'Point', coordinates: [lng, lat] },
  };
}

/** seed.csv（ヘッダ: name,category,lat,long,address）を Spot 用のデータに変換する */
export function parseSpotSeeds(csv: Buffer | string): SpotSeed[] {
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as SeedRow[];
  const seeds = rows.map((row, i) => toSpotSeed(row, i + 2));

  const names = new Set<string>();
  for (const { name } of seeds) {
    if (names.has(name))
      throw new Error(`seed.csv に name の重複があります: ${name}`);
    names.add(name);
  }
  return seeds;
}
