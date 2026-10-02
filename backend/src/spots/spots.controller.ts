import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { SpotResponseDto } from './spot-response.dto.js';
import { SpotsService } from './spots.service.js';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get()
  @ApiOkResponse({ type: [SpotResponseDto] })
  findAll(): Promise<SpotResponseDto[]> {
    return this.spotsService.findAll();
  }
}
