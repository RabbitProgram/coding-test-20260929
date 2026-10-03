import { BadGatewayException, Injectable } from '@nestjs/common';
import type { GeocodeResult } from './reverse-geocode.js';

const ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json';

/** Google の Geocoding API（Web サービス）で、座標から住所を引く */
@Injectable()
export class GoogleGeocoder {
  /** 住所がない場所（海の上など）は、空の配列を返す。それ以外の失敗は、BadGatewayException */
  async reverse(lat: number, lng: number, apiKey: string) {
    const url = new URL(ENDPOINT);
    url.search = new URLSearchParams({
      latlng: `${lat},${lng}`,
      language: 'ja',
      key: apiKey,
    }).toString();

    const response = await fetch(url);
    if (!response.ok) {
      throw new BadGatewayException(
        `Geocoding API responded ${response.status}`,
      );
    }
    const body = (await response.json()) as {
      status: string;
      results: GeocodeResult[];
    };
    if (body.status === 'ZERO_RESULTS') return [];
    if (body.status !== 'OK') {
      // error_message に、キーの一部が含まれることがあるので、status だけを返す
      throw new BadGatewayException(`Geocoding API status: ${body.status}`);
    }
    return body.results;
  }
}
