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

  it('距離を渡したときだけ、distance を含める', () => {
    const spot = {
      id: '1',
      name: '東京駅',
      category: '交通機関',
      address: null,
      location: { type: 'Point', coordinates: [139.767125, 35.681236] },
      createdAt: new Date(),
    } as Spot;

    expect(toSpotResponse(spot, 1234.5).distance).toBe(1234.5);
    expect(toSpotResponse(spot)).not.toHaveProperty('distance');
  });
});
