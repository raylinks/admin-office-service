import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
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

export class SetCryptoTransactionFeesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ type: SetFeeDto })
  buy: SetFeeDto;

  @ApiProperty({ type: SetFeeDto })
  sell: SetFeeDto;
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
