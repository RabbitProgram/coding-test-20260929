import { Controller, Get } from '@nestjs/common';
import { SpotsService, type SpotResponse } from './spots.service.js';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get()
  findAll(): Promise<SpotResponse[]> {
    return this.spotsService.findAll();
  }
}
