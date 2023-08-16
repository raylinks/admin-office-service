import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum FlagAction {
  FLAG = 1,
  UNFLAG = 0,
}

export class FlagTransactionDto {
  @ApiProperty({
    type: String,
  })
  remark: string;

  @IsEnum(FlagAction)
  action: FlagAction;
}
