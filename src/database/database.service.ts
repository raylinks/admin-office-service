import { Inject, Injectable, Logger } from '@nestjs/common';
import { Connection, Pool } from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  private logger = new Logger(DatabaseService.name);

  constructor(@Inject('WALLET_DB_CONNECTION') private walletDb: Connection,
   @Inject('USER_DB_CONNECTION') private userServicePool: Pool) { }

  async getAssets() {
    const [assets] = await this.walletDb.query(`SELECT * FROM assets`);

    return (assets as any[]).map((asset) => {
      return {
        symbol: asset.symbol,
        isFiat: asset.is_fiat,
        isStableCoin: asset.is_stable_coin,
        sellable: asset.sellable,
        buyable: asset.buyable,
        swapable: asset.swapable,
        withdrawable: asset.withdrawable,
        depositable: asset.depositable,
        name: asset.name,
        logo: asset.logo,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      };
    });
  }

  async getTxFees() {
    const [fees] = await this.walletDb.query(`SELECT * FROM tx_fees`);

    return (fees as any[]).map((fee) => {
      return {
        id: fee.id,
        feeFlat: fee.fee_flat,
        feePercentage: fee.fee_percentage,
        event: fee.event,
        symbol: fee.symbol,
        minAmount: fee.min_amount,
        maxAmount: fee.max_amount,
        createdAt: fee.created_at,
        updatedAt: fee.updated_at,
      };
    });
  }
}
