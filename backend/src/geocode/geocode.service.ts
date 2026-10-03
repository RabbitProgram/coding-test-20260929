import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ADDRESS_CACHE, type AddressCache } from './address-cache.js';
import { GoogleGeocoder } from './google-geocoder.js';
import { cacheKey, pickAddress, snapToGrid } from './reverse-geocode.js';

/** キャッシュを残す期間の既定値（秒）。Google の規約上、座標のキャッシュは最長 30 日 */
export const DEFAULT_CACHE_TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  constructor(
    @Inject(ADDRESS_CACHE) private readonly cache: AddressCache,
    private readonly geocoder: GoogleGeocoder,
  ) {}

  /** 座標の住所を返す。同じ格子（約 100 m）は、キャッシュ（Redis）から返し、API を呼ばない */
  async reverse(lat: number, lng: number): Promise<string | null> {
    const point = snapToGrid(lat, lng);
    const key = cacheKey(point.lat, point.lng);

    const cached = await this.readCache(key);
    if (cached !== undefined) return cached;

    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GOOGLE_MAPS_SERVER_API_KEY が設定されていない',
      );
    }
    // API の失敗は、キャッシュに残さない（次の呼び出しで、やり直せるようにする）
    const results = await this.geocoder.reverse(point.lat, point.lng, apiKey);
    const address = pickAddress(results);

    // 住所がない場所（null）も残す。同じ場所で、何度も課金されないようにする
    await this.writeCache(key, address);
    return address;
  }

  // undefined はキャッシュになし。Redis が落ちていても、住所は引けるようにする（キャッシュなしで動く）
  private async readCache(key: string): Promise<string | null | undefined> {
    try {
      const value = await this.cache.get(key);
      return value === null ? undefined : (JSON.parse(value) as string | null);
    } catch (error) {
      this.logger.warn(`キャッシュを読めなかった: ${String(error)}`);
      return undefined;
    }
  }

  private async writeCache(key: string, address: string | null) {
    const ttl =
      Number(process.env.GEOCODE_CACHE_TTL_SECONDS) ||
      DEFAULT_CACHE_TTL_SECONDS;
    try {
      await this.cache.set(key, JSON.stringify(address), ttl);
    } catch (error) {
      this.logger.warn(`キャッシュに書けなかった: ${String(error)}`);
    }
  }
}
