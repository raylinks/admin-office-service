import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import {
  EnableDisableCryptoAssetDto,
  QueryCryptoTransactionsDto,
  SetCryptoTransactionFeesDto,
} from './crypto.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CryptoService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    private prisma: PrismaClient,
    private dbService: DatabaseService,
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
    const assets = await this.dbService.getAssets();
    const symbols = assets.map((asset) => asset.symbol) as string[];

    const allRates = [];
    const rates = await this.dbService.getTxFees();

    const buySellRates = rates.filter(
      (rate) => rate.event === 'BuyEvent' || rate.event === 'SellEvent',
    ) as any[];

    symbols.forEach((symbol) => {
      const rates = [];
      const rate = buySellRates.filter((r) => r.symbol === symbol);
      if (rate.length > 0) {
        const sell = rate.find((rs) => rs.event === 'BuyEvent');
        const buy = rate.find((rb) => rb.event === 'SellEvent');

        rates.push({
          sell: {
            percentage: (sell && sell.feePercentage) || null,
            flat: (sell && sell.feeFlat) || null,
          },
          buy: {
            percentage: (buy && buy.feePercentage) || null,
            flat: (buy && buy.feeFlat) || null,
          },
        });
      } else {
        // making sure it sends something back
        rates.push({
          sell: {
            percentage: null,
            flat: null,
          },
          buy: {
            percentage: null,
            flat: null,
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

  async setTransactionFees(
    operatorId: string,
    data: SetCryptoTransactionFeesDto,
  ) {
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
