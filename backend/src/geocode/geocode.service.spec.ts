import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { AddressCache } from './address-cache.js';
import { GeocodeService } from './geocode.service.js';
import type { GoogleGeocoder } from './google-geocoder.js';

const TOKYO = [
  {
    types: ['sublocality_level_3'],
    formatted_address: '日本、東京都千代田区丸の内１丁目',
  },
];

// メモリ上の、簡単なキャッシュ（Redis の代わり）
function memoryCache() {
  const store = new Map<string, string>();
  const ttls: number[] = [];
  const cache: AddressCache = {
    get: (key) => Promise.resolve(store.get(key) ?? null),
    set: (key, value, ttl) => {
      store.set(key, value);
      ttls.push(ttl);
      return Promise.resolve();
    },
  };
  return { cache, store, ttls };
}

describe('GeocodeService.reverse', () => {
  const reverse = vi.fn();
  const geocoder = { reverse } as unknown as GoogleGeocoder;

  beforeEach(() => {
    reverse.mockReset().mockResolvedValue(TOKYO);
    vi.stubEnv('GOOGLE_MAPS_SERVER_API_KEY', 'test-key');
    vi.stubEnv('GEOCODE_CACHE_TTL_SECONDS', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('同じ格子の 2 回目以降は、API を呼ばずに、キャッシュから返す', async () => {
    const { cache } = memoryCache();
    const service = new GeocodeService(cache, geocoder);

    expect(await service.reverse(35.6812, 139.7671)).toBe(
      '東京都千代田区丸の内１丁目',
    );
    expect(await service.reverse(35.6814, 139.7669)).toBe(
      '東京都千代田区丸の内１丁目',
    );
    expect(reverse).toHaveBeenCalledTimes(1);
  });

  it('API には、丸めた座標を渡す', async () => {
    const { cache } = memoryCache();
    await new GeocodeService(cache, geocoder).reverse(35.6816, 139.7674);
    expect(reverse).toHaveBeenCalledWith(35.682, 139.767, 'test-key');
  });

  it('住所がない場所（null）も、キャッシュして、何度も API を呼ばない', async () => {
    reverse.mockResolvedValue([]);
    const { cache } = memoryCache();
    const service = new GeocodeService(cache, geocoder);

    expect(await service.reverse(0, 0)).toBeNull();
    expect(await service.reverse(0, 0)).toBeNull();
    expect(reverse).toHaveBeenCalledTimes(1);
  });

  it('API が失敗したときは、キャッシュに残さず、次の呼び出しでやり直す', async () => {
    reverse.mockRejectedValueOnce(new BadGatewayException('OVER_QUERY_LIMIT'));
    const { cache, store } = memoryCache();
    const service = new GeocodeService(cache, geocoder);

    await expect(service.reverse(35.681, 139.767)).rejects.toThrow(
      BadGatewayException,
    );
    expect(store.size).toBe(0);
    expect(await service.reverse(35.681, 139.767)).toBe(
      '東京都千代田区丸の内１丁目',
    );
  });

  it('Redis が落ちていても、API から住所を返す', async () => {
    const down: AddressCache = {
      get: () => Promise.reject(new Error('ECONNREFUSED')),
      set: () => Promise.reject(new Error('ECONNREFUSED')),
    };
    const service = new GeocodeService(down, geocoder);
    expect(await service.reverse(35.681, 139.767)).toBe(
      '東京都千代田区丸の内１丁目',
    );
  });

  it('保存期間は、環境変数で変えられる（既定は 1 日）', async () => {
    const { cache, ttls } = memoryCache();
    const service = new GeocodeService(cache, geocoder);

    await service.reverse(35.681, 139.767);
    vi.stubEnv('GEOCODE_CACHE_TTL_SECONDS', '600');
    await service.reverse(35.7, 139.7);
    expect(ttls).toEqual([86_400, 600]);
  });

  it('サーバー用の API キーがないときは、503（キャッシュにあれば、キーなしでも返す）', async () => {
    vi.stubEnv('GOOGLE_MAPS_SERVER_API_KEY', '');
    const { cache } = memoryCache();
    const service = new GeocodeService(cache, geocoder);

    await expect(service.reverse(35.681, 139.767)).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(reverse).not.toHaveBeenCalled();
  });
});
