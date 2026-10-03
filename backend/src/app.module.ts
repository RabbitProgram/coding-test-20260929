import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { dataSourceOptions } from './database/data-source.js';
import { GeocodeModule } from './geocode/geocode.module.js';
import { SpotsModule } from './spots/spots.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    SpotsModule,
    GeocodeModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
