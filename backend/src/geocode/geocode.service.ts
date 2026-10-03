import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGeocoder } from './google-geocoder.js';
import { pickAddress } from './reverse-geocode.js';

@Injectable()
export class GeocodeService {
  constructor(private readonly geocoder: GoogleGeocoder) {}

  /** 座標の住所を返す。Google の規約上、結果は保存せず、毎回 API を呼ぶ */
  async reverse(lat: number, lng: number): Promise<string | null> {
    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GOOGLE_MAPS_SERVER_API_KEY が設定されていない',
      );
    }
    return pickAddress(await this.geocoder.reverse(lat, lng, apiKey));
  }
}
