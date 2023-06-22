import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  private logger = new Logger(DatabaseService.name);

  constructor(@Inject('WALLET_DB_CONNECTION') private walletDb: Pool) {}

  async getAssets() {
    const [assets] = await this.walletDb.execute(`SELECT * FROM assets`);

    return assets as any[];
  }

  async getTxFees() {
    const [fees] = await this.walletDb.execute(`SELECT * FROM tx_fees`);

    return fees as any[];
  }
}
