import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FindSpotsQueryDto } from './find-spots-query.dto.js';
import { SpotResponseDto } from './spot-response.dto.js';
import { SpotsService } from './spots.service.js';

@ApiTags('Spots')
@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get()
  @ApiOperation({
    summary: 'スポット一覧の取得',
    description:
      '登録されているスポットを返す。lat・lng・radius を指定すると、中心から radius メートル以内のスポットだけを、近い順に（distance つきで）返す。指定しない場合は、id の昇順で全件を返す。',
  })
  @ApiOkResponse({ description: 'スポットの配列', type: [SpotResponseDto] })
  @ApiBadRequestResponse({
    description: 'lat・lng・radius の一部だけの指定、または範囲外の値',
  })
  findAll(@Query() query: FindSpotsQueryDto): Promise<SpotResponseDto[]> {
    return this.spotsService.findAll(query);
  }
}
