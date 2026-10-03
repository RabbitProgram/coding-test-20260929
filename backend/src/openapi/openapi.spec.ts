import { readFileSync } from 'node:fs';
import { Test } from '@nestjs/testing';
import { AppController } from '../app.controller.js';
import { GeocodeController } from '../geocode/geocode.controller.js';
import { GeocodeService } from '../geocode/geocode.service.js';
import { SpotsController } from '../spots/spots.controller.js';
import { SpotsService } from '../spots/spots.service.js';
import { createOpenApiDocument } from './create-document.js';

describe('openapi.json', () => {
  it('コードの定義と一致している（API を変えたら npm run openapi で更新する）', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController, SpotsController, GeocodeController],
      providers: [
        { provide: SpotsService, useValue: {} },
        { provide: GeocodeService, useValue: {} },
      ],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    const generated = JSON.parse(JSON.stringify(createOpenApiDocument(app)));
    const committed = JSON.parse(
      readFileSync(new URL('../../openapi.json', import.meta.url), 'utf-8'),
    );
    await app.close();

    expect(generated).toEqual(committed);
  });
});
