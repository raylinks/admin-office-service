import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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

export class QueryCryptoTransactionsDto {
  @ApiPropertyOptional({ default: 40 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  page?: number;
}

export class EnableDisableCryptoAssetDto {
  @ApiProperty({ enum: CryptoAssetType })
  @IsOptional()
  symbol: string;

  @IsOptional()
  @IsEnum(CryptoAssetType)
  type: CryptoAssetType;
}

export class SetCryptoTransactionFeesDto {
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

  @ApiProperty({ enum: TransactionEventType })
  @IsEnum(TransactionEventType)
  @IsNotEmpty()
  event: TransactionEventType;
}
