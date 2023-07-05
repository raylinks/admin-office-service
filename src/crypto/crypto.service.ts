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

@Injectable()
export class CryptoService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    private prisma: PrismaClient,
  ) {}
  async fetchAllTransactions(query: QueryCryptoTransactionsDto) {
    return await lastValueFrom(
      this.walletClient.send(
        { cmd: 'fetch.transactions' },
        { isFiat: false, ...query },
      ),
    );
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

  async fetchRates() {
    const assets = await lastValueFrom(
      this.walletClient.send({ cmd: 'assets.get' }, { service: 'admin' }),
    );
    const symbols = assets.map((asset) => asset.symbol);

    const allRates = [];
    const rates = await lastValueFrom(
      this.walletClient.send({ cmd: 'tx_fees.get' }, { service: 'admin' }),
    );

    const buySellRates = rates.filter(
      (rate) => rate.event === 'BuyEvent' || rate.event === 'SellEvent',
    );

    symbols.forEach((symbol) => {
      const rates = [];
      const rate = buySellRates.filter((r) => r.symbol === symbol);
      if (rate.length > 0) {
        const sell = rate.find((rs) => rs.event === 'BuyEvent');
        const buy = rate.find((rb) => rb.event === 'SellEvent');
        const withdrawal = rate.find(
          (rw) => rw.event === 'CryptoWithdrawalEvent',
        );

        rates.push({
          sell: sell && {
            id: sell.id,
            percentage: sell.feePercentage || null,
            flat: sell.feeFlat || null,
            minAmount: sell.minAmount || null,
            maxAmount: sell.maxAmount || null,
          },
          buy: buy && {
            id: buy.id,
            percentage: buy.feePercentage || null,
            flat: buy.feeFlat || null,
            minAmount: buy.minAmount || null,
            maxAmount: buy.maxAmount || null,
          },
          withdrawal: withdrawal && {
            id: withdrawal.id,
            percentage: withdrawal.feePercentage || null,
            flat: withdrawal.feeFlat || null,
            minAmount: withdrawal.minAmount || null,
            maxAmount: withdrawal.maxAmount || null,
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
      event: TransactionEventType.SellEvent,
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
        action: AUDIT_ACTIONS.ENABLE_CRYPTO,
        operatorId,
        details: `${data.symbol} rate set by ${operatorId}`,
      },
    });
  }
}
