import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { GeocodeService } from './geocode.service.js';
import { ReverseAddressResponseDto } from './reverse-address-response.dto.js';
import { ReverseGeocodeQueryDto } from './reverse-geocode-query.dto.js';

@Controller('geocode')
export class GeocodeController {
  constructor(private readonly geocodeService: GeocodeService) {}

  @Get()
  @ApiOperation({
    summary: '座標から住所を取得',
    description:
      'lat・lng の住所を、丁目までで返す。外部の Geocoding API を呼ぶ。結果は保存しない。',
  })
  @ApiOkResponse({ type: ReverseAddressResponseDto })
  @ApiBadRequestResponse({
    description: 'lat・lng が、数値でない、または範囲外',
  })
  @ApiBadGatewayResponse({ description: '外部の Geocoding API が失敗した' })
  @ApiServiceUnavailableResponse({
    description: 'サーバー用の API キーが設定されていない',
  })
  async reverse(
    @Query() query: ReverseGeocodeQueryDto,
  ): Promise<ReverseAddressResponseDto> {
    return { address: await this.geocodeService.reverse(query.lat, query.lng) };
  }
}
