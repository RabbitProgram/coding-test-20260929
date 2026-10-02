import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
      '登録されているすべてのスポットを、id の昇順で返す。絞り込みやページングは未対応（常に全件）。',
  })
  @ApiOkResponse({ description: 'スポットの配列', type: [SpotResponseDto] })
  findAll(): Promise<SpotResponseDto[]> {
    return this.spotsService.findAll();
  }
}
