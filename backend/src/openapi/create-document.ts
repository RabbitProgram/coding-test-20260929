import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const API_TITLE = '位置情報探索アプリ API';

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setDescription('コーディングテスト用')
    .setVersion('1.0')
    .build();
  return SwaggerModule.createDocument(app, config);
}
