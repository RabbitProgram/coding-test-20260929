import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GeocodeService } from './geocode.service.js';
import type { GoogleGeocoder } from './google-geocoder.js';

const TOKYO = [
  {
    types: ['sublocality_level_3'],
    formatted_address: '日本、東京都千代田区丸の内１丁目',
  },
];

describe('GeocodeService.reverse', () => {
  const reverse = vi.fn();
  const service = new GeocodeService({ reverse } as unknown as GoogleGeocoder);

  beforeEach(() => {
    reverse.mockReset().mockResolvedValue(TOKYO);
    vi.stubEnv('GOOGLE_MAPS_SERVER_API_KEY', 'test-key');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('API の結果から、丁目までの住所を返す', async () => {
    expect(await service.reverse(35.6812, 139.7671)).toBe(
      '東京都千代田区丸の内１丁目',
    );
    expect(reverse).toHaveBeenCalledWith(35.6812, 139.7671, 'test-key');
  });

  it('結果は保存せず、呼ぶたびに API を呼ぶ', async () => {
    await service.reverse(35.681, 139.767);
    await service.reverse(35.681, 139.767);
    expect(reverse).toHaveBeenCalledTimes(2);
  });

  it('住所がない場所は null', async () => {
    reverse.mockResolvedValue([]);
    expect(await service.reverse(0, 0)).toBeNull();
  });

  it('API が失敗したときは、そのまま伝える', async () => {
    reverse.mockRejectedValue(new BadGatewayException('OVER_QUERY_LIMIT'));
    await expect(service.reverse(35.681, 139.767)).rejects.toThrow(
      BadGatewayException,
    );
  });

  it('サーバー用の API キーがないときは、503', async () => {
    vi.stubEnv('GOOGLE_MAPS_SERVER_API_KEY', '');
    await expect(service.reverse(35.681, 139.767)).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(reverse).not.toHaveBeenCalled();
  });
});
