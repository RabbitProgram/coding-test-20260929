import { ApiProperty } from '@nestjs/swagger';

/** GET /spots が返す 1 件分。フロントの型は、この定義から自動生成する */
export class SpotResponseDto {
  @ApiProperty({
    example: '1',
    description: 'スポット ID（bigint のため文字列で返す）',
  })
  id: string;

  @ApiProperty({ example: '東京タワー', description: 'スポット名' })
  name: string;

  @ApiProperty({
    example: '観光名所',
    description: 'カテゴリ（観光名所、公園、寺院など）',
  })
  category: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '東京都港区',
    description: '住所。未登録の場合は null',
  })
  address: string | null;

  @ApiProperty({ example: 35.658581, description: '緯度（WGS84）' })
  lat: number;

  @ApiProperty({ example: 139.745433, description: '経度（WGS84）' })
  lng: number;
}
