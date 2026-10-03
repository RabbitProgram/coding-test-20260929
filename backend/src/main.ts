import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { API_TITLE, createOpenApiDocument } from './openapi/create-document.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // クエリを DTO の型（数値）に変換し、検証する
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, stopAtFirstError: true }),
  );

  // Swagger UI（/docs）と仕様（/docs-json）。本番では公開しない
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, createOpenApiDocument(app), {
      customSiteTitle: API_TITLE,
      // タグがないと「default」の見出しが出るので隠す
      customCss: '.swagger-ui .opblock-tag { display: none; }',
    });
  }

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
