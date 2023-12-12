import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { KycLevel } from 'src/utils/constants';


export enum BuyTransactionType {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}
/**
 * A DTO representing data to be sent when getting users.
 */
export class QueryCardBuyDto {
  @ApiPropertyOptional({ default: 40 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'furex id',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @Matches(/^[a-zA-Z ]*$/, { message: 'lastName must be alphabets' })
  userId: string;

  @ApiPropertyOptional({ enum: BuyTransactionType, required: false })
  @IsEnum(BuyTransactionType)
  @IsOptional()
  status: BuyTransactionType;

  @ApiPropertyOptional({ description: 'user account number', required: false })
  @IsString()
  @IsOptional()
  date: string;

  @ApiPropertyOptional({ default: 'oldest and newest', required: false })
  @IsOptional()
  sortBy: string;

  @ApiPropertyOptional({
    description: 'cardName',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @Matches(/^[a-zA-Z ]*$/, { message: 'lastName must be alphabets' })
  cardName: string;

  @ApiPropertyOptional({
    description: 'cardName',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @Matches(/^[a-zA-Z ]*$/, { message: 'lastName must be alphabets' })
  country: string;

  @ApiPropertyOptional({
    description: 'cardName',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @Matches(/^[a-zA-Z ]*$/, { message: 'lastName must be alphabets' })
  currency: string;
}
