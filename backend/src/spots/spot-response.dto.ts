import { ApiProperty } from '@nestjs/swagger';

/** GET /spots が返す 1 件分。フロントの型は、この定義から自動生成する */
export class SpotResponseDto {
  @ApiProperty({ example: '1', description: 'bigint のため文字列で返す' })
  id: string;

  @ApiProperty({ example: '東京タワー' })
  name: string;

  @ApiProperty({ example: '観光名所' })
  category: string;

  @ApiProperty({ type: String, nullable: true, example: '東京都港区' })
  address: string | null;

  @ApiProperty({ example: 35.658581, description: '緯度' })
  lat: number;

  @ApiProperty({ example: 139.745433, description: '経度' })
  lng: number;
}
