import { readFileSync } from 'node:fs';
import { parseSpotSeeds } from './seed-loader.js';

describe('parseSpotSeeds', () => {
  it('CSV を [経度, 緯度] の GeoJSON Point に変換する', () => {
    const csv =
      'name,category,lat,long,address\n東京駅,交通機関,35.681236,139.767125,東京都千代田区\n';

    expect(parseSpotSeeds(csv)).toEqual([
      {
        name: '東京駅',
        category: '交通機関',
        address: '東京都千代田区',
        location: { type: 'Point', coordinates: [139.767125, 35.681236] },
      },
    ]);
  });

  it('住所が空なら null にする', () => {
    const csv = 'name,category,lat,long,address\nA,B,35,139,\n';

    expect(parseSpotSeeds(csv)[0].address).toBeNull();
  });

  it('座標が不正ならエラー（行番号付き）', () => {
    const csv = 'name,category,lat,long,address\nA,B,95,139,x\n';

    expect(() => parseSpotSeeds(csv)).toThrow('2 行目');
  });

  it('name が重複していればエラー', () => {
    const csv = 'name,category,lat,long,address\nA,B,35,139,x\nA,B,36,139,y\n';

    expect(() => parseSpotSeeds(csv)).toThrow('重複');
  });

  it('実際の seeds/seed.csv が全件読み込める', () => {
    const seeds = parseSpotSeeds(readFileSync('seeds/seed.csv'));

    expect(seeds).toHaveLength(200);
    expect(seeds[0].name).toBe('東京タワー');
  });
});
