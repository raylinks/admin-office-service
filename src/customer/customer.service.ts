import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Pool } from 'mysql2/promise';
import { DB_NAMES, RMQ_NAMES, CURRENCY } from 'src/utils/constants';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientProxy,
    @Inject(DB_NAMES.WALLET) private walletDB: Pool,
  ) {}

  async fetchWalletBalance(id: string, currency?: CURRENCY) {
    currency = currency || 'USD';
    const balance: object | null = {};
    let totalBalance = 0;
    let totalDepositAmount = 0;
    let totalWithdrawalAmount = 0;
    let rate = 0;
    try {
      const [result] = await this.walletDB.query(
        ` SELECT symbol,balance FROM wallets WHERE user_id = ?`,
        [id],
      );
      const [deposits] = await this.walletDB.query(
        `SELECT asset_symbol,SUM(amount) as amount FROM transactions WHERE eventType IN ('FiatDepositEvent', 'CryptoDepositEvent') AND user_id = ? AND status='CONFIRMED' GROUP BY asset_symbol;`,
        [id],
      );
      const [withdrawals] = await this.walletDB.query(
        `SELECT asset_symbol,SUM(amount) as amount FROM transactions WHERE eventType IN ('FiatWithdrawalEvent', 'CryptoWithdrawalEvent') AND user_id = ? AND status='CONFIRMED' GROUP BY asset_symbol;`,
        [id],
      );

      // preload rate if currency is set to NGN
      if (currency === 'NGN') rate = await this.fetchCurrentNGNRate();

      for (const wallet of result as { symbol: string; balance: number }[]) {
        const amount = wallet.balance;
        let value = await this.getUSDValue({
          amount,
          symbol: wallet.symbol,
        });
        if (currency === 'NGN') {
          if (wallet.symbol !== 'NGN') value *= rate;
          else value = amount;
        }
        totalBalance += value;
        balance[wallet.symbol] = {
          balance: parseFloat(amount.toFixed(getDP(wallet.symbol))),
          value: parseFloat(value.toFixed(2)),
        };
      }

      for (const deposit of deposits as {
        asset_symbol: string;
        amount: number;
      }[]) {
        let amount = deposit.amount;
        if (currency === 'USD')
          amount = await this.getUSDValue({
            symbol: deposit.asset_symbol,
            amount: deposit.amount,
          });
        if (currency === 'NGN' && deposit.asset_symbol !== 'NGN')
          amount *= rate;
        totalDepositAmount += amount;
      }

      for (const withdrawal of withdrawals as {
        asset_symbol: string;
        amount: number;
      }[]) {
        let amount = withdrawal.amount;
        if (currency === 'USD')
          amount = await this.getUSDValue({
            symbol: withdrawal.asset_symbol,
            amount: withdrawal.amount,
          });
        // convert to ngn rate
        if (currency === 'NGN' && withdrawal.asset_symbol !== 'NGN')
          amount *= rate;
        totalWithdrawalAmount += amount;
      }

      return {
        balance,
        totalBalance: parseFloat(totalBalance.toFixed(2)),
        totalDepositAmount: parseFloat(totalDepositAmount.toFixed(2)),
        totalWithdrawalAmount: parseFloat(totalWithdrawalAmount.toFixed(2)),
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

  private async fetchCurrentNGNRate(): Promise<number> {
    const [result] = await this.walletDB.query(
      `SELECT sell_rate FROM trade_rates WHERE fiat_symbol='NGN' ORDER BY updated_at DESC LIMIT 1`,
    );
    const rate = result[0];
    if (!rate) return 0;
    return rate.sell_rate;
  }
}
function getDP(symbol: string): number {
  return ['USD', 'NGN'].includes(symbol) ? 2 : 8;
}
