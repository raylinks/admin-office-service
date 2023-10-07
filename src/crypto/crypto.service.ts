import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import {
  EnableDisableCryptoAssetDto,
  QueryCryptoTransactionsDto,
  SetCryptoFees,
  TransactionEventType,
  UpdateCryptoTransactionFeeDto,
  SetCryptoTransactionRateDto,
  cryptoFeesDto,
  CryptoFeeOptions,
  EnableCryptoDto,
  DenoArray,
} from './crypto.dto';
import { ExcelService } from 'src/exports/excel.service';
import { Pool } from 'mysql2/promise';
import * as cuid from 'cuid';
import { Response } from 'express';

@Injectable()
export class CryptoService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    private prisma: PrismaClient,
    private excelService: ExcelService,
    @Inject('WALLET_SERVICE_DATABASE_CONNECTION') private walletDB: Pool,
  ) { }
  async fetchAllTransactions(query: QueryCryptoTransactionsDto) {
    return await lastValueFrom(
      this.walletClient.send(
        { cmd: 'fetch.transactions' },
        { isFiat: false, ...query },
      ),
    );
  }

  async exportAllTransactions(
    res: Response,
    query: QueryCryptoTransactionsDto,
  ) {
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

  async enableAsset(operatorId: string, symbol: string, data: EnableCryptoDto) {
    this.walletClient.emit(
      { cmd: 'crypto.enable' },
      {
        symbol: symbol,
        stateType: data.type,
        pairs: data.pairs,
      },
    );

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.ENABLE_CRYPTO,
        operatorId,
        details: `${symbol} enabled by ${operatorId}`,
      },
    });
  }

  async fetchOneTransaction(id: string) {
    return await lastValueFrom(
      this.walletClient.send({ cmd: 'transaction.get' }, id),
    );
  }

  async exportOneTransactions(res: Response, id: string) {
    const transaction = await this.fetchOneTransaction(id);
    return await this.excelService.export(res, transaction, 'crypto', 'single');
  }

  async fetchRates() {
    const allRates = [];

    const [assets, dbRates] = await Promise.all([
      this.walletDB.query(`SELECT * FROM assets`),
      this.walletDB.query(`SELECT * FROM tx_fees`),
    ]);

    const symbols = (assets[0] as any[]).map((asset) => asset.symbol);

    symbols.forEach((symbol) => {
      const rates = [];
      const rate = (dbRates[0] as any[]).filter((r) => r.symbol === symbol);
      if (rate.length > 0) {
        const sell = rate.find(
          (rs) => rs['transaction_event_type'] === 'SellEvent',
        );
        const buy = rate.find(
          (rb) => rb['transaction_event_type'] === 'BuyEvent',
        );
        const withdrawal = rate.find(
          (rw) => rw['transaction_event_type'] === 'CryptoWithdrawalEvent',
        );

        rates.push({
          buy: {
            id: buy?.id || null,
            percentage: buy?.fee_percentage || null,
            flat: buy?.fee_flat || null,
            minAmount: buy?.min_amount || null,
            maxAmount: buy?.max_amount || null,
          },
          sell: {
            id: sell?.id || null,
            percentage: sell?.fee_percentage || null,
            flat: sell?.fee_flat || null,
            minAmount: sell?.min_amount || null,
            maxAmount: sell?.max_amount || null,
          },
          withdrawal: {
            id: withdrawal?.id || null,
            percentage: withdrawal?.fee_percentage || null,
            flat: withdrawal?.fee_flat || null,
            minAmount: withdrawal?.min_amount || null,
            maxAmount: withdrawal?.max_amount || null,
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
    try {
      if (data.buy)
        await this.setTransactionRates(operatorId, {
          event: TransactionEventType.BuyEvent,
          symbol: data.symbol,
          feeFlat: data.buy.feeFlat,
          maxAmount: data.buy.maxAmount,
          minAmount: data.buy.minAmount,
          feePercentage: data.buy.feePercentage,
        });
      if (data.sell)
        await this.setTransactionRates(operatorId, {
          event: TransactionEventType.SellEvent,
          symbol: data.symbol,
          feeFlat: data.sell.feeFlat,
          maxAmount: data.sell.maxAmount,
          minAmount: data.sell.minAmount,
          feePercentage: data.sell.feePercentage,
        });
      if (data.swap)
        await this.setTransactionRates(operatorId, {
          event: TransactionEventType.SwapEvent,
          symbol: data.symbol,
          feeFlat: data.sell.feeFlat,
          maxAmount: data.sell.maxAmount,
          minAmount: data.sell.minAmount,
          feePercentage: data.sell.feePercentage,
        });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('An error occured, err: ', err);
    }
  }

  async setCryptoTransactionFees(
    operatorId: string,
    data: UpdateCryptoTransactionFeeDto,
  ) {
    if (data.swap) {
      this.setTransactionFees(
        operatorId,
        CryptoFeeOptions.SWAP,
        data.symbol,
        data.swap,
      );
    }
    if (data.sell) {
      this.setTransactionFees(
        operatorId,
        CryptoFeeOptions.SELL,
        data.symbol,
        data.sell,
      );
    }
    if (data.buy) {
      this.setTransactionFees(
        operatorId,
        CryptoFeeOptions.BUY,
        data.symbol,
        data.buy,
      );
    }
    if (data.send) {
      this.setTransactionFees(
        operatorId,
        CryptoFeeOptions.SEND,
        data.symbol,
        data.send,
      );
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
    const allFees = [];

    const [assets, fees] = await Promise.all([
      lastValueFrom(
        this.walletClient.send({ cmd: 'assets.get' }, { service: 'admin' }),
      ) as Promise<any[]>,
      lastValueFrom(
        this.walletClient.send({ cmd: 'fetch.crypto.fees' }, true),
      ) as Promise<any[]>,
    ]);

    const symbols = assets
      .filter((r) => r.isFiat === false)
      .map((asset) => asset.symbol);

    const eventFees = fees.filter(
      (fee) =>
        fee.feeOption === 'BUY' ||
        fee.feeOption === 'SWAP' ||
        fee.feeOption === 'SELL' ||
        fee.feeOption === 'SEND',
    );

    symbols.forEach((symbol) => {
      const fees = [];
      const fee = eventFees.filter((r) => r.symbol === symbol);

      fees.push({
        send: {
          flat: this.filterFees(fee, CryptoFeeOptions.SEND, 'flat'),
          percentage: this.filterFees(fee, CryptoFeeOptions.SEND, 'percentage'),
        },
        sell: {
          flat: this.filterFees(fee, CryptoFeeOptions.SELL, 'flat'),
          percentage: this.filterFees(fee, CryptoFeeOptions.SELL, 'percentage'),
        },
        buy: {
          flat: this.filterFees(fee, CryptoFeeOptions.BUY, 'flat'),
          percentage: this.filterFees(fee, CryptoFeeOptions.BUY, 'percentage'),
        },
        swap: {
          flat: this.filterFees(fee, CryptoFeeOptions.SWAP, 'flat'),
          percentage: this.filterFees(fee, CryptoFeeOptions.SWAP, 'percentage'),
        },
      });

      allFees.push({
        symbol,
        fees,
      });
    });

    return allFees;
  }

  filterFees(data: any, feeOption: CryptoFeeOptions, feeType: string) {
    const feeOptionData = data.filter(
      (rb: { feeOption: CryptoFeeOptions }) => rb.feeOption === feeOption,
    );
    const feeTypeData = feeOptionData.filter(
      (rb: { feeType: string }) => rb.feeType == feeType,
    );
    const fee = DenoArray.reduce((accumulator, value) => {
      let datum = feeTypeData.find((rb: { deno: string }) => rb.deno == value);
      datum = datum ? datum : { id: null, value: 0, capAmount: 0 };
      return {
        ...accumulator,
        [value]: { id: datum.id, value: datum.value, cap: datum.capAmount },
      };
    }, {});
    return fee;
  }

  async fetchFee(symbol: string) {
    const fee = await lastValueFrom(
      this.walletClient.send({ cmd: 'fetch.crypto.fee.single' }, symbol),
    );
    return {
      send: {
        flat: this.filterFees(fee, CryptoFeeOptions.SEND, 'flat'),
        percentage: this.filterFees(fee, CryptoFeeOptions.SEND, 'percentage'),
      },
      sell: {
        flat: this.filterFees(fee, CryptoFeeOptions.SELL, 'flat'),
        percentage: this.filterFees(fee, CryptoFeeOptions.SELL, 'percentage'),
      },
      buy: {
        flat: this.filterFees(fee, CryptoFeeOptions.BUY, 'flat'),
        percentage: this.filterFees(fee, CryptoFeeOptions.BUY, 'percentage'),
      },
      swap: {
        flat: this.filterFees(fee, CryptoFeeOptions.SWAP, 'flat'),
        percentage: this.filterFees(fee, CryptoFeeOptions.SWAP, 'percentage'),
      },
    };
  }

  async setTransactionRates(operatorId: string, data: SetCryptoFees) {
    try {
      const [result] = await this.walletDB.query(
        `SELECT * FROM tx_fees WHERE symbol = ? AND transaction_event_type = ?`,
        [data.symbol, data.event],
      );
      const fee = result[0];
      if (fee)
        await this.walletDB.execute(
          `UPDATE tx_fees
          SET
          fee_flat = ?, max_amount = ?, min_amount = ?, fee_percentage = ?, updated_at = NOW() WHERE id = ?`,
          [
            data.feeFlat || fee.fee_flat,
            data.maxAmount || fee.max_amount,
            data.minAmount || fee.min_amount,
            data.feePercentage || fee.fee_percentage,
            fee.id,
          ],
        );
      else
        await this.walletDB.execute(
          `
        INSERT INTO tx_fees (
          id, transaction_event_type, fee_flat, max_amount, min_amount, fee_percentage, created_at
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

      await this.prisma.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.SET_CRYPTO_FEE,
          operatorId,
          details: `${data.symbol} rates set by ${operatorId}`,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Rate could not be set, err: ',
        err,
      );
    }
  }

  async setTransactionFees(
    operatorId: string,
    feeOption: CryptoFeeOptions,
    symbol: string,
    data: cryptoFeesDto,
  ) {
    const [result] = await this.walletDB.query(
      `SELECT * FROM crypto_fees WHERE symbol = ? AND fee_option = ?  AND fee_type = ? AND deno = ?`,
      [symbol, feeOption, data.feeType, data.deno],
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
          value = ?, cap_amount = ?, updated_at = NOW() WHERE symbol = ? AND fee_option = ? AND fee_type = ? AND deno = ?`,
        [
          data.value || fee.value,
          data.cap || fee.cap_amount,
          symbol || fee.symbol,
          feeOption || fee.fee_option,
          data.feeType || fee.fee_type,
          data.deno || fee.deno,
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
