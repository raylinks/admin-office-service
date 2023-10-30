import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Pool } from 'mysql2/promise';
import { DB_NAMES, RMQ_NAMES } from 'src/utils/constants';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientProxy,
    @Inject(DB_NAMES.WALLET) private walletDB: Pool,
  ) {}

  async fetchWalletBalance(id: string) {
    const balance = {};
    let totalBalance = 0;
    let totalDepositAmount = 0;
    let totalWithdrawalAmount = 0;
    try {
      const [result] = await this.walletDB.query(
        ` SELECT symbol,balance FROM wallets WHERE user_id = ?`,
        [id],
      );
      const [deposits] = await this.walletDB.query(
        `SELECT asset_symbol,SUM(amount) as amount FROM transactions WHERE eventType IN ('FiatDepositEvent', 'CryptoDepositEvent') AND user_id = ? GROUP BY asset_symbol;`,
        [id],
      );
      const [withdrawals] = await this.walletDB.query(
        `SELECT asset_symbol,SUM(amount) as amount FROM transactions WHERE eventType IN ('FiatWithdrawalEvent', 'CryptoWithdrawalEvent') AND user_id = ? GROUP BY asset_symbol;`,
        [id],
      );
      console.log(deposits);
      console.log(withdrawals);

      for (const wallet of result as { symbol: string; balance: number }[]) {
        const usd = await this.getUSDValue({
          amount: wallet.balance,
          symbol: wallet.symbol,
        });
        balance[wallet.symbol] = {
          balance: wallet.balance,
          usd,
        };
        totalBalance += usd;
      }
      for (const deposit of deposits as any[]) {
        const amount = await this.getUSDValue({
          symbol: deposit.asset_symbol,
          amount: deposit.amount,
        });
        console.log('deposit', { s: deposit.asset_symbol, amount });
        totalDepositAmount += amount;
      }
      for (const withdrawal of withdrawals as any[]) {
        const amount = await this.getUSDValue({
          symbol: withdrawal.asset_symbol,
          amount: withdrawal.amount,
        });
        console.log('withdrawal', { s: withdrawal.asset_symbol, amount });
        totalWithdrawalAmount += amount;
      }

      return {
        balance,
        totalBalance,
        totalDepositAmount,
        totalWithdrawalAmount,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `There was an issue fetching customer balance: ${err}`,
      );
    }
  }
  async getUSDValue(b: { symbol: string; amount: number }) {
    const [result] = await this.walletDB.query(
      `SELECT price FROM asset_prices WHERE asset_symbol = ? ORDER BY price_at DESC LIMIT 1;`,
      [b.symbol],
    );
    const asset = result[0];
    if (!asset) return 0;
    return asset.price * b.amount;
  }

  async fetchTransactions(id: string) {}
}
