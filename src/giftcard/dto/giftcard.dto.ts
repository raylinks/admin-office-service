import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  card: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  value?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  margin?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  operator?: string;
}

export class CreateCardCurrencyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency: string;
}

export class CreateCardReceiptDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receipt: string;
}

export class CreateCardNumberDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  value?: string;
}

export class CreateCardDenominationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  range: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  rate?: number;
}

export class CreateGiftCardDto {
  @ApiProperty()
  card: CreateCardDto;

  @ApiPropertyOptional()
  currency: CreateCardCurrencyDto;

  @ApiPropertyOptional()
  receipt: CreateCardReceiptDto;

  @ApiPropertyOptional()
  number: CreateCardNumberDto;

  @ApiPropertyOptional()
  denomination: CreateCardDenominationDto;
}

export class SetCardRateDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  rate: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  denominationId: string;
}
