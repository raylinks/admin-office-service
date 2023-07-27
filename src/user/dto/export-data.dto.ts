import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum Exportype {
  EXCEL = 'excel',
  CSV = 'csv'
}

export class ExportDataDto {

  @ApiProperty({
    type: String,
    example: Exportype,
  })
  @IsNotEmpty()
  type: string;
}