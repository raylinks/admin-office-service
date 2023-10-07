import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum CryptoAssetType {
  BUY = 'BUY',
  SELL = 'SELL',
  SWAP = 'SWAP',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum TransactionEventType {
  SwapEvent = 'SwapEvent',
  SellEvent = 'SellEvent',
  BuyEvent = 'BuyEvent',
  InternalTransferEvent = 'InternalTransferEvent',
  CryptoWithdrawalEvent = 'CryptoWithdrawalEvent',
  FiatWithdrawalEvent = 'FiatWithdrawalEvent',
  CryptoDepositEvent = 'CryptoDepositEvent',
  FiatDepositEvent = 'FiatDepositEvent',
  ReversalEvent = 'ReversalEvent',
  GiftcardEvent = 'GiftcardEvent',
}

export enum CryptoFeeOptions {
  BUY = 'BUY',
  SELL = 'SELL',
  SWAP = 'SWAP',
  SEND = 'SEND',
}

export class QueryCryptoTransactionsDto {
  @ApiPropertyOptional({ default: 40 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  page?: number;
  @ApiPropertyOptional()
  userId?: string;
  @ApiPropertyOptional()
  from?: Date;
  @ApiPropertyOptional()
  to?: Date;
  @ApiPropertyOptional()
  transactionId?: string;
  @ApiPropertyOptional({
    enum: ['INIT', 'PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED'],
  })
  status?: 'INIT' | 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  @ApiPropertyOptional()
  symbol?: string;
  @ApiPropertyOptional()
  amount?: number;
  @ApiPropertyOptional()
  pairSwap?: string;
  @ApiPropertyOptional({
    enum: TransactionEventType,
  })
  @Expose({ name: 'event' })
  eventType?: TransactionEventType;
}

export class EnableDisableCryptoAssetDto {
  @ApiProperty({ enum: CryptoAssetType })
  @IsOptional()
  symbol: string;

  @IsOptional()
  @IsEnum(CryptoAssetType)
  type: CryptoAssetType;
}

export class SetFeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  feeFlat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  feePercentage?: number;
}

export class EnableCryptoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: CryptoAssetType;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  pairs?: Array<string>;
}

export class SetCryptoTransactionRateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiPropertyOptional({ type: SetFeeDto })
  buy?: SetFeeDto;

  @ApiPropertyOptional({ type: SetFeeDto })
  sell?: SetFeeDto;

  @ApiPropertyOptional({ type: SetFeeDto })
  swap?: SetFeeDto;
}

export class SetCryptoFees {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  feeFlat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  feePercentage?: number;

  @ApiHideProperty()
  event: TransactionEventType;
}

export class CryptoFeesDto {
  @ApiProperty({ enum: ['flat', 'percentage'] })
  @IsNotEmpty()
  @IsEnum(['flat', 'percentage'])
  feeType: 'flat' | 'percentage';

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  value: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  cap: number;

  @ApiProperty()
  @IsNotEmpty()
  deno: string;
}

export class UpdateCryptoTransactionFeeDto {
  @ApiProperty({ type: CryptoFeesDto })
  @ValidateNested({ each: true })
  @Type(() => CryptoFeesDto)
  buy: CryptoFeesDto;

  @ApiProperty({ type: CryptoFeesDto })
  @ValidateNested({ each: true })
  @Type(() => CryptoFeesDto)
  sell: CryptoFeesDto;

  @ApiProperty({ type: CryptoFeesDto })
  @ValidateNested({ each: true })
  @Type(() => CryptoFeesDto)
  swap: CryptoFeesDto;

  @ApiProperty({ type: CryptoFeesDto })
  @ValidateNested({ each: true })
  @Type(() => CryptoFeesDto)
  send: CryptoFeesDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;
}

export const DenoArray = [
  '1-49',
  '50-69',
  '70-99',
  '100-499',
  '500-999',
  '1000-2999',
  '3000-4999',
  '5000-9999',
];
