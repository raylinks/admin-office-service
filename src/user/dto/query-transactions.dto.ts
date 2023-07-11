import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ETransactionType {
  NGN = 'NGN',
  BTC = 'BTC',
  ETH = 'ETH',
  BNB = 'BNB',
  USDT = 'USDT',
}

export enum ETransactionSubtype {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BUY = 'BUY',
  SELL = 'SELL',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
}

export enum ETransactionStatus {
  SUCCESSFUL = 'SUCCESSFUL',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDING = 'REFUNDING',
  REFUNDING_FAILED = 'REFUNDING_FAILED',
  REFUNDED = 'REFUNDED',
}
export class QueryTransactionsDto {
  @ApiPropertyOptional({
    type: String,
    example: 'NGN',
  })
  type?: string;

  @ApiPropertyOptional({
    type: String,
    example: '',
  })
  transactionId?: string;

  @ApiPropertyOptional({
    type: String,
    example: ETransactionSubtype,
  })
  subtype?: string;
  @ApiPropertyOptional({
    type: String,
    example: ETransactionStatus,
  })
  status?: string;
  @ApiPropertyOptional({ type: Date, example: new Date() })
  from?: Date;
  @ApiPropertyOptional({ type: Date, example: new Date() })
  to?: Date;
  @ApiPropertyOptional({ type: String, enum: ['FIAT', 'CRYPTO'] })
  assetType?: 'FIAT' | 'CRYPTO';
}
