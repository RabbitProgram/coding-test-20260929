import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { StatusResponseDto } from './status-response.dto.js';

@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: '起動確認',
    description:
      'バックエンドが起動していれば `{ "status": "ok" }` を返す。DB の接続状態までは確認しない。',
  })
  @ApiOkResponse({ description: '起動している', type: StatusResponseDto })
  getStatus(): StatusResponseDto {
    return { status: 'ok' };
  }
}
