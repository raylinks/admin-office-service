import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import {
  EnableDisableCryptoAssetDto,
  QueryCryptoTransactionsDto,
  SetCryptoTransactionFeesDto,
  SetCryptoFees,
  TransactionEventType,
} from './crypto.dto';
import { ExcelService } from 'src/exports/excel.service';

@Injectable()
export class CryptoService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    private prisma: PrismaClient,
    private excelService: ExcelService, 
  ) {}
  async fetchAllTransactions(query: QueryCryptoTransactionsDto) {
    return await lastValueFrom(
      this.walletClient.send(
        { cmd: 'fetch.transactions' },
        { isFiat: false, ...query },
      ),
    );
  }

  async exportAllTransactions(query: QueryCryptoTransactionsDto){
    const {transactions} = await this.fetchAllTransactions(query);
    return await this.excelService.export(transactions, 'crypto', 'bulk');
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

  async exportOneTransactions(id: string){
    const transaction = await this.fetchOneTransaction(id);
    return await this.excelService.export(transaction, 'crypto', 'single');
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

  async setBuySellRate(operatorId: string, data: SetCryptoTransactionFeesDto) {
    await Promise.all([
      this.setTransactionFees(operatorId, {
        event: TransactionEventType.BuyEvent,
        symbol: data.symbol,
        feeFlat: data.buy.feeFlat,
        maxAmount: data.buy.maxAmount,
        minAmount: data.buy.minAmount,
        feePercentage: data.buy.feePercentage,
      }),
      this.setTransactionFees(operatorId, {
        event: TransactionEventType.SellEvent,
        symbol: data.symbol,
        feeFlat: data.sell.feeFlat,
        maxAmount: data.sell.maxAmount,
        minAmount: data.sell.minAmount,
        feePercentage: data.sell.feePercentage,
      }),
    ]);
  }

  async setWithdrawalRate(operatorId: string, data: SetCryptoFees) {
    await this.setTransactionFees(operatorId, {
      event: TransactionEventType.CryptoWithdrawalEvent,
      symbol: data.symbol,
      feeFlat: data.feeFlat,
      maxAmount: data.maxAmount,
      minAmount: data.minAmount,
      feePercentage: data.feePercentage,
    });
  }

  async setTransactionFees(operatorId: string, data: SetCryptoFees) {
    this.walletClient.emit({ cmd: 'crypto.fees.set' }, data);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.SET_CRYPTO_FEE,
        operatorId,
        details: `${data.symbol} fee set by ${operatorId}`,
      },
    });
  }
}
