import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import {
  EnableDisableCryptoAssetDto,
  QueryCryptoTransactionsDto,
  SetCryptoFees,
  TransactionEventType,
  updateCryptoTransactionFeeDto,
  SetCryptoTransactionRateDto,
  cryptoFeesDto,
  CryptoFeeOptions,
} from './crypto.dto';
import { ExcelService } from 'src/exports/excel.service';
import { Pool } from 'mysql2/promise';
import * as cuid from 'cuid';

@Injectable()
export class CryptoService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    private prisma: PrismaClient,
    private excelService: ExcelService,
    @Inject('WALLET_SERVICE_DATABASE_CONNECTION') private walletDB: Pool,
  ) {}
  async fetchAllTransactions(query: QueryCryptoTransactionsDto) {
    return await lastValueFrom(
      this.walletClient.send(
        { cmd: 'fetch.transactions' },
        { isFiat: false, ...query },
      ),
    );
  }

  async exportAllTransactions(res, query: QueryCryptoTransactionsDto) {
    const { transactions } = await this.fetchAllTransactions(query);
    return await this.excelService.export(res, transactions, 'crypto', 'bulk');
  }

  async fetchBalance() {
    return await lastValueFrom(
      this.walletClient.send(
        { cmd: 'crypto.balance.fetch' },
        { isFiat: false },
      ),
    );
  }

  async disableAsset(operatorId: string, data: EnableDisableCryptoAssetDto) {
    this.walletClient.emit(
      { cmd: 'crypto.disable' },
      {
        symbol: data.symbol,
        stateType: data.type,
      },
    );

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.DISABLE_CRYPTO,
        operatorId,
        details: `${data.symbol} disabled by ${operatorId}`,
      },
    });
  }

  async enableAsset(operatorId: string, data: EnableDisableCryptoAssetDto) {
    this.walletClient.emit(
      { cmd: 'crypto.enable' },
      {
        symbol: data.symbol,
        stateType: data.type,
      },
    );

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.ENABLE_CRYPTO,
        operatorId,
        details: `${data.symbol} enabled by ${operatorId}`,
      },
    });
  }

  async fetchOneTransaction(id: string) {
    return await lastValueFrom(
      this.walletClient.send({ cmd: 'transaction.get' }, id),
    );
  }

  async exportOneTransactions(res, id: string) {
    const transaction = await this.fetchOneTransaction(id);
    return await this.excelService.export(res, transaction, 'crypto', 'single');
  }

  async fetchRates() {
    const allRates = [];

    const [assets, rates] = await Promise.all([
      lastValueFrom(
        this.walletClient.send({ cmd: 'assets.get' }, { service: 'admin' }),
      ) as Promise<any[]>,
      lastValueFrom(
        this.walletClient.send({ cmd: 'tx_fees.get' }, { service: 'admin' }),
      ) as Promise<any[]>,
    ]);

    const symbols = assets.map((asset) => asset.symbol);
    const eventRates = rates.filter(
      (rate) =>
        rate.event === 'BuyEvent' ||
        rate.event === 'SellEvent' ||
        rate.event === 'CryptoWithdrawalEvent',
    );

    symbols.forEach((symbol) => {
      const rates = [];
      const rate = eventRates.filter((r) => r.symbol === symbol);
      if (rate.length > 0) {
        const sell = rate.find((rs) => rs.event === 'SellEvent');
        const buy = rate.find((rb) => rb.event === 'BuyEvent');
        const withdrawal = rate.find(
          (rw) => rw.event === 'CryptoWithdrawalEvent',
        );

        rates.push({
          sell: sell && {
            id: sell.id,
            percentage: sell.feePercentage,
            flat: sell.feeFlat,
            minAmount: sell.minAmount,
            maxAmount: sell.maxAmount,
          },
          buy: buy && {
            id: buy.id,
            percentage: buy.feePercentage,
            flat: buy.feeFlat,
            minAmount: buy.minAmount,
            maxAmount: buy.maxAmount,
          },
          withdrawal: withdrawal && {
            id: withdrawal.id,
            percentage: withdrawal.feePercentage,
            flat: withdrawal.feeFlat,
            minAmount: withdrawal.minAmount,
            maxAmount: withdrawal.maxAmount,
          },
        });
      } else {
        // making sure it sends something back
        rates.push({
          sell: {
            percentage: null,
            flat: null,
            minAmount: null,
            maxAmount: null,
          },
          buy: {
            percentage: null,
            flat: null,
            minAmount: null,
            maxAmount: null,
          },
          withdrawal: {
            percentage: null,
            flat: null,
            minAmount: null,
            maxAmount: null,
          },
        });
      }
      allRates.push({
        symbol,
        rates,
      });
    });

    return allRates;
  }

  async setBuySellRate(operatorId: string, data: SetCryptoTransactionRateDto) {
    if (data.buy)
      this.setTransactionRates(operatorId, {
        event: TransactionEventType.BuyEvent,
        symbol: data.symbol,
        feeFlat: data.buy.feeFlat,
        maxAmount: data.buy.maxAmount,
        minAmount: data.buy.minAmount,
        feePercentage: data.buy.feePercentage,
      });
    if (data.sell)
      this.setTransactionRates(operatorId, {
        event: TransactionEventType.SellEvent,
        symbol: data.symbol,
        feeFlat: data.sell.feeFlat,
        maxAmount: data.sell.maxAmount,
        minAmount: data.sell.minAmount,
        feePercentage: data.sell.feePercentage,
      });
   if (data.swap)
      this.setTransactionRates(operatorId, {
        event: TransactionEventType.SwapEvent,
        symbol: data.symbol,
        feeFlat: data.sell.feeFlat,
        maxAmount: data.sell.maxAmount,
        minAmount: data.sell.minAmount,
        feePercentage: data.sell.feePercentage,
      });
  }


  async setCryptoTransactionFees(
    operatorId: string,
    data: updateCryptoTransactionFeeDto,
  ) {
    if (data.swap)
    {
      this.setTransactionFees(operatorId, CryptoFeeOptions.SWAP, data.symbol, data.swap);
    }
    if (data.sell)
    {
      this.setTransactionFees(operatorId, CryptoFeeOptions.SELL, data.symbol, data.sell);
    }
    if (data.buy)
    {
      this.setTransactionFees(operatorId, CryptoFeeOptions.BUY, data.symbol, data.buy);
    }
    if (data.send)
    {
      this.setTransactionFees(operatorId, CryptoFeeOptions.SEND, data.symbol, data.send);
    }
  }

  async setWithdrawalRate(operatorId: string, data: SetCryptoFees) {
    await this.setTransactionRates(operatorId, {
      event: TransactionEventType.CryptoWithdrawalEvent,
      symbol: data.symbol,
      feeFlat: data.feeFlat,
      maxAmount: data.maxAmount,
      minAmount: data.minAmount,
      feePercentage: data.feePercentage,
    });
  }

  async fetchFees() {
    return await lastValueFrom( this.walletClient.send( { cmd: 'fetch.crypto.fees' }, true ), );
  } 

  async fetchFee(symbol: string) {
    return await lastValueFrom( this.walletClient.send( { cmd: 'fetch.crypto.fee.single' }, symbol ), );
  }

  async setTransactionRates(operatorId: string, data: SetCryptoFees) {
    // this.walletClient.emit({ cmd: 'crypto.fees.set' }, data);
    const [result] = await this.walletDB.query(
      `SELECT * FROM tx_fees WHERE symbol = ? AND event = ?`,
      [data.symbol, data.event],
    );
    const fee = result[0];
    if (!fee)
      await this.walletDB.execute(
        `
        INSERT INTO tx_fees (
          id, event, fee_flat, max_amount, min_amount, fee_percentage, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW()`,
        [
          cuid(),
          data.event,
          data.feeFlat || 0,
          data.maxAmount || 0,
          data.minAmount || 0,
          data.feePercentage || 0,
        ],
      );
    else
      await this.walletDB.execute(
        `UPDATE tx_fees
          SET
          fee_flat = ?, max_amount = ?, min_amount = ?, fee_percentage = ?, updated_at = NOW()`,
        [
          data.feeFlat || fee.fee_flat,
          data.maxAmount || fee.max_amount,
          data.minAmount || fee.min_amount,
          data.feePercentage || fee.fee_percentage,
        ],
      );

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.SET_CRYPTO_FEE,
        operatorId,
        details: `${data.symbol} rates set by ${operatorId}`,
      },
    });
  }

  async setTransactionFees(
    operatorId: string,
    feeOption: CryptoFeeOptions,
    symbol: string,
    data: cryptoFeesDto,
  ) { 
    const [result] = await this.walletDB.query(
      `SELECT * FROM crypto_fees WHERE symbol = ? AND fee_option = ?`,
      [symbol, feeOption],
    );  
    const fee = result[0];
    if (!fee)
      await this.walletDB.execute(
        `
        INSERT INTO crypto_fees (
          id, symbol, fee_option, fee_type, deno, value, cap_amount, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          cuid(),
          symbol,
          feeOption,
          data.feeType,
          data.deno,
          data.value,
          data.cap,
        ],
      );
    else
      await this.walletDB.execute(
        `UPDATE crypto_fees
          SET
          fee_type = ?, value = ?, deno = ?, cap = ?, updated_at = NOW() WHERE symbol = ? AND fee_option = ?`,
        [
          data.feeType || fee.fee_type,
          data.value || fee.value,
          data.deno || fee.deno,
          data.cap || fee.cap,
          symbol || fee.symbol,
          feeOption || fee.fee_option,
        ],
      );

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.SET_CRYPTO_FEE,
        operatorId,
        details: `${symbol} fees set by ${operatorId}`,
      },
    });
  }
}
