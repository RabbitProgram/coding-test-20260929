import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { StatusResponseDto } from './status-response.dto.js';

@Controller()
export class AppController {
  // 起動しているかどうかだけを返す
  @Get()
  @ApiOkResponse({ type: StatusResponseDto })
  getStatus(): StatusResponseDto {
    return { status: 'ok' };
  }
}
