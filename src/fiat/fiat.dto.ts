import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryFiatTransactionsDto {
  @ApiPropertyOptional({ default: 40 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  page?: number;
}

export class SetFiatTradeRateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fiatSymbol: string;

  @ApiPropertyOptional()
  @IsOptional()
  buyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  sellRate?: number;
}
