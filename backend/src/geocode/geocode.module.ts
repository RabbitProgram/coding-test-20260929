import { Module } from '@nestjs/common';
import { GeocodeController } from './geocode.controller.js';
import { GeocodeService } from './geocode.service.js';
import { GoogleGeocoder } from './google-geocoder.js';

@Module({
  controllers: [GeocodeController],
  providers: [GeocodeService, GoogleGeocoder],
})
export class GeocodeModule {}
