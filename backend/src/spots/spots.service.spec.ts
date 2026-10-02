import { toSpotResponse } from './spots.service.js';
import type { Spot } from './spot.entity.js';

describe('toSpotResponse', () => {
  it('GeoJSON の [経度, 緯度] を lat / lng に変換する', () => {
    const spot = {
      id: '1',
      name: '東京駅',
      category: '交通機関',
      address: '東京都千代田区',
      location: { type: 'Point', coordinates: [139.767125, 35.681236] },
      createdAt: new Date(),
    } as Spot;

    expect(toSpotResponse(spot)).toEqual({
      id: '1',
      name: '東京駅',
      category: '交通機関',
      address: '東京都千代田区',
      lat: 35.681236,
      lng: 139.767125,
    });
  });
});
