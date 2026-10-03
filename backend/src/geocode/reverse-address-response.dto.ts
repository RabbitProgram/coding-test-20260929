import { ApiProperty } from '@nestjs/swagger';

export class ReverseAddressResponseDto {
  @ApiProperty({
    example: '東京都千代田区丸の内１丁目',
    nullable: true,
    type: String,
    description:
      '座標の住所（丁目まで。番地・建物名・国名・郵便番号は含まない）。海の上など住所がない場所は null',
  })
  address: string | null;
}
