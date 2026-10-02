import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsNumber, Max, Min, ValidateIf } from 'class-validator';

/** 距離で絞り込むときの半径の上限（メートル） */
export const MAX_RADIUS_METERS = 1_000_000;

// lat / lng / radius は、3つそろって指定するか、まったく指定しないかのどちらか
const isNearbySearch = (q: FindSpotsQueryDto) =>
  q.lat !== undefined || q.lng !== undefined || q.radius !== undefined;

/** GET /spots のクエリ。中心（lat, lng）と半径（radius）を渡すと、その範囲のスポットだけを返す */
export class FindSpotsQueryDto {
  @ApiPropertyOptional({
    example: 35.681236,
    description: '中心の緯度（WGS84）。lng と radius とセットで指定する',
  })
  @ValidateIf(isNearbySearch)
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({
    example: 139.767125,
    description: '中心の経度（WGS84）。lat と radius とセットで指定する',
  })
  @ValidateIf(isNearbySearch)
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: `中心からの距離（メートル）。0 より大きく ${MAX_RADIUS_METERS} 以下。lat と lng とセットで指定する`,
  })
  @ValidateIf(isNearbySearch)
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(MAX_RADIUS_METERS)
  radius?: number;
}
