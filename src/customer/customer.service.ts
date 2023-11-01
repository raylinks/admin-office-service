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
    const balance: object | null = {
      fiat: [],
      crypto: [],
    };
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
        balance[this.balanceType(wallet.symbol)].push({
          symbol: wallet.symbol,
          balance: parseFloat(amount.toFixed(this.getDP(wallet.symbol))),
          value: parseFloat(value.toFixed(2)),
        });
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
        totalDepositedAmount: parseFloat(totalDepositAmount.toFixed(2)),
        totalWithdrawnAmount: parseFloat(totalWithdrawalAmount.toFixed(2)),
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

  async fetchTransactions(id: string, currency?: CURRENCY) {
    let rate = 0;
    try {
      // preload rate if currency is set to NGN
      if (currency === 'NGN') rate = await this.fetchCurrentNGNRate();

      const [result] = await this.walletDB.query(
        `SELECT
        asset_symbol AS symbol,
        eventType,
        SUM(amount) as amount,
        MAX(created_at) AS createdAt,
        MAX(type) AS type
      FROM transactions
        WHERE user_id=? AND status='CONFIRMED'
      GROUP BY asset_symbol,eventType`,
        [id],
      );

      let transactions = await Promise.all(
        (result as any[]).map(async (transaction) => {
          if (currency)
            if (currency !== transaction.symbol)
              transaction.amount = await this.getUSDValue({
                symbol: transaction.symbol,
                amount: transaction.amount,
              });
          if (currency === 'NGN' && transaction.symbol !== 'NGN')
            transaction.amount *= rate;
          transaction.amount = parseFloat(
            transaction.amount.toFixed(
              currency ? 2 : this.getDP(transaction.symbol),
            ),
          );
          return transaction;
        }),
      );

      transactions = transactions.reduce((transactions, transaction) => {
        const symbol = transaction.symbol;
        if (!transactions[symbol]) transactions[symbol] = [];
        transactions[symbol].push(transaction);

        return transactions;
      }, {});

      return transactions;
    } catch (err) {
      throw new InternalServerErrorException(
        `There was an issue fetching transactions: ${err}`,
      );
    }
  }

  private async fetchCurrentNGNRate(): Promise<number> {
    const [result] = await this.walletDB.query(
      `SELECT sell_rate FROM trade_rates WHERE fiat_symbol='NGN' ORDER BY updated_at DESC LIMIT 1`,
    );
    const rate = result[0];
    if (!rate) return 0;
    return rate.sell_rate;
  }
  private getDP(symbol: string): number {
    return ['USD', 'NGN'].includes(symbol) ? 2 : 8;
  }
  private balanceType(symbol: string) {
    return ['USD', 'NGN'].includes(symbol) ? 'fiat' : 'crypto';
  }
}
