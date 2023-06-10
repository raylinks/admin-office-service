import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2faDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
