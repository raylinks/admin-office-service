import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
   @IsNotEmpty()
  assetSymbol: string;
 
}
