import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { dataSourceOptions } from './database/data-source.js';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions)],
  controllers: [AppController],
})
export class AppModule {}
