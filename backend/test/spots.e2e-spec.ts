import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { SpotsController } from './../src/spots/spots.controller.js';
import { SpotsService } from './../src/spots/spots.service.js';

const spots = [
  {
    id: '1',
    name: '東京駅',
    category: '交通機関',
    address: '東京都千代田区',
    lat: 35.681236,
    lng: 139.767125,
  },
];

describe('GET /spots (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    // DB なしで HTTP 層だけを検証するためサービスをスタブに差し替える
    const moduleRef = await Test.createTestingModule({
      controllers: [SpotsController],
      providers: [
        { provide: SpotsService, useValue: { findAll: async () => spots } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('200 とスポットの配列を返す', () =>
    request(app.getHttpServer()).get('/spots').expect(200).expect(spots));
});
