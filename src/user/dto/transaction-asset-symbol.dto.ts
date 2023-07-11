import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ETransactionType {
  NGN = 'NGN',
  BTC = 'BTC',
  ETH = 'ETH',
  BNB = 'BNB',
  USDT = 'USDT',
}

export class TransactionAssetSymbolDto {
 
  @ApiPropertyOptional({
    type: String,
    example: ETransactionType,
  })
  assetSymbol: string;
 
}
