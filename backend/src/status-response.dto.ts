import { ApiProperty } from '@nestjs/swagger';

export class StatusResponseDto {
  @ApiProperty({ example: 'ok', description: '起動していれば常に "ok"' })
  status: string;
}
