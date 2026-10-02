import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { createOpenApiDocument } from './create-document.js';

// preview: true は DB に接続せず、ルート定義だけを読み込む
const app = await NestFactory.create(AppModule, {
  preview: true,
  logger: false,
});
const document = createOpenApiDocument(app);

// dist/openapi/generate.js から見た backend/openapi.json
writeFileSync(
  `${import.meta.dirname}/../../openapi.json`,
  `${JSON.stringify(document, null, 2)}\n`,
);
await app.close();
console.log('openapi: wrote openapi.json');
