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
  EnableCryptoDto,
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

  async enableAsset(operatorId: string,   symbol:string,  data: EnableCryptoDto) {
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
    const allFees = [];

    const [assets, fees] = await Promise.all([
      lastValueFrom(
        this.walletClient.send({ cmd: 'assets.get' }, { service: 'admin' }),
      ) as Promise<any[]>,
      lastValueFrom(
        this.walletClient.send( { cmd: 'fetch.crypto.fees' }, true ),
      ) as Promise<any[]>,
    ]);

    const symbols = assets.filter((r) => r.isFiat === false).map((asset) => asset.symbol);  
    
    const eventFees = fees.filter(
      (fee) =>
      fee.event === 'SellEvent' ||
      fee.event === 'SwapEvent' ||
      fee.event === 'BuyEvent' ||
      fee.event === 'CryptoWithdrawalEvent',
    );

    symbols.forEach((symbol) => {
      const fees = [];
      const fee = eventFees.filter((r) => r.symbol === symbol);

      if (fee.length > 0) {
        const sell = fee.find((rs) => rs.event === 'SellEvent');
        const buy = fee.find((rb) => rb.event === 'SwapEvent');
        const swap = fee.find((rs) => rs.event === 'BuyEvent');
        const send = fee.find((rb) => rb.event === 'CryptoWithdrawalEvent');

        fees.push({
          sell: sell && {
            id: sell.id,
            feeType: sell.feeFlat > 0 ? 'flat' : 'percentage',
            deno: `${sell.minAmount}-${sell.maxAmount}`,
            amount: sell.feeFlat > 0 ? sell.feeFlat : sell.feePercentage,
            capAmount: sell.cap
          },
          buy: buy && {
            id: buy.id,
            feeType: buy.feeFlat > 0 ? 'flat' : 'percentage',
            deno: `${buy.minAmount}-${buy.maxAmount}`,
            amount: buy.feeFlat > 0 ? buy.feeFlat : buy.feePercentage,
            capAmount: buy.cap
          },
          send: send && {
            id: send.id,
            feeType: send.feeFlat > 0 ? 'flat' : 'percentage',
            deno: `${send.minAmount}-${send.maxAmount}`,
            amount: send.feeFlat > 0 ? send.feeFlat : send.feePercentage,
            capAmount: send.cap
          },
          swap: swap && {
            id: swap.id,
            feeType: swap.feeFlat > 0 ? 'flat' : 'percentage',
            deno: `${swap.minAmount}-${swap.maxAmount}`,
            amount: swap.feeFlat > 0 ? swap.feeFlat : swap.feePercentage,
            capAmount: swap.cap
          },
        });
      } else {
        // making sure it sends something back
        fees.push({
          sell:  {
            id: null,
            feeType: null,
            deno: null,
            amount: null,
            capAmount: null
          },
          buy: {
            id: null,
            feeType: null,
            deno: null,
            amount: null,
            capAmount: null
          },
          send: {
            id: null,
            feeType: null,
            deno: null,
            amount: null,
            capAmount: null
          },
          swap: {
            id: null,
            feeType: null,
            deno: null,
            amount: null,
            capAmount: null
          },
        });
      }
      allFees.push({
        symbol,
        fees,
      });
    });

    return allFees;

  } 

  async fetchFee(symbol: string) {
    const fees =  await lastValueFrom( this.walletClient.send( { cmd: 'fetch.crypto.fee.single' }, symbol ), );
    const filterFees = [];
    fees.forEach(fee => {
      filterFees.push({
          id: fee.id,
          feeType: fee.feeFlat > 0 ? 'flat' : 'percentage',
          deno: `${fee.minAmount}-${fee.maxAmount}`,
          amount: fee.feeFlat > 0 ? fee.feeFlat : fee.feePercentage,
          capAmount: fee.cap,
          feeOption: this.getCryptoFeeOptionsEnumKey(fee.event)
      })
    })
    return filterFees
  }

  getCryptoFeeOptionsEnumKey (value){
    const indexOfValue = Object.values(CryptoFeeOptions).indexOf(value as unknown as CryptoFeeOptions);
    return Object.keys(CryptoFeeOptions)[indexOfValue];
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

    const min_amount = data.deno.split('-').length > 0 ? parseInt(data.deno.split('-')[0]) : 0;
    const max_amount = data.deno.split('-').length > 1 ? parseInt(data.deno.split('-')[1]) : 0;
    const fee_flat = data.feeType == 'flat' ? data.value : 0;
    const fee_percentage = data.feeType == 'percentage' ? data.value : 0;
    const cap = data.cap;

    const [result] = await this.walletDB.query(
      `SELECT * FROM tx_fees WHERE symbol = ? AND transaction_event_type = ?`,
      [symbol, feeOption],
    );  
    const fee = result[0];
    if (!fee)
      await this.walletDB.execute(
        `
        INSERT INTO tx_fees (
          id, symbol, transaction_event_type, min_amount, max_amount, fee_flat, fee_percentage, cap, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          cuid(),
          symbol,
          feeOption,
          min_amount,
          max_amount,
          fee_flat,
          fee_percentage,
          cap
        ],
      );
    else
      await this.walletDB.execute(
        `UPDATE tx_fees
          SET
          min_amount = ?, max_amount = ?, fee_flat = ?, fee_percentage = ?, cap = ?, updated_at = NOW() WHERE symbol = ? AND transaction_event_type = ?`,
        [
          min_amount || fee.max_amount,
          max_amount || fee.max_amount,
          fee_flat || fee.fee_flat,
          fee_percentage || fee.fee_percentage,
          data.cap || fee.cap,
          symbol || fee.symbol,
          feeOption || fee.transaction_event_type,
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
