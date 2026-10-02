import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  FindSpotsQueryDto,
  MAX_RADIUS_METERS,
} from './find-spots-query.dto.js';

const pipe = new ValidationPipe({ transform: true });
const parse = (query: Record<string, string>) =>
  pipe.transform(query, { type: 'query', metatype: FindSpotsQueryDto });

describe('FindSpotsQueryDto', () => {
  it('何も指定しなければ、絞り込みなしとして通る', async () => {
    const parsed = (await parse({})) as FindSpotsQueryDto;

    expect(parsed.lat).toBeUndefined();
    expect(parsed.lng).toBeUndefined();
    expect(parsed.radius).toBeUndefined();
  });

  it('クエリ文字列を数値に変換する', async () => {
    const parsed = (await parse({
      lat: '35.681236',
      lng: '139.767125',
      radius: '5000',
    })) as FindSpotsQueryDto;

    expect(parsed).toMatchObject({
      lat: 35.681236,
      lng: 139.767125,
      radius: 5000,
    });
  });

  it.each([
    ['lat だけ', { lat: '35' }],
    ['lng だけ', { lng: '139' }],
    ['radius だけ', { radius: '5000' }],
    ['radius がない', { lat: '35', lng: '139' }],
  ])('一部だけの指定はエラー（%s）', async (_label, query) => {
    await expect(parse(query)).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([
    ['lat が範囲外', { lat: '91', lng: '139', radius: '1000' }],
    ['lng が範囲外', { lat: '35', lng: '181', radius: '1000' }],
    ['radius が 0', { lat: '35', lng: '139', radius: '0' }],
    ['radius が負', { lat: '35', lng: '139', radius: '-1' }],
    [
      'radius が上限超過',
      { lat: '35', lng: '139', radius: String(MAX_RADIUS_METERS + 1) },
    ],
    ['数値でない', { lat: 'abc', lng: '139', radius: '1000' }],
  ])('不正な値はエラー（%s）', async (_label, query) => {
    await expect(parse(query)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('範囲の境界値は通る', async () => {
    await expect(
      parse({ lat: '-90', lng: '180', radius: String(MAX_RADIUS_METERS) }),
    ).resolves.toBeDefined();
  });
});
