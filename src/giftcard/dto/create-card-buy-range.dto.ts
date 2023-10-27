import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCardBuyRangeDto {
  @IsString()
  @IsNotEmpty()
  card: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  operator: string;

  @IsString()
  @IsNotEmpty()
  provider: string;
}
