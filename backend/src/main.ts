import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { API_TITLE, createOpenApiDocument } from './openapi/create-document.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger UI（/docs）と仕様（/docs-json）。本番では公開しない
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, createOpenApiDocument(app), {
      customSiteTitle: API_TITLE,
    });
  }

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
