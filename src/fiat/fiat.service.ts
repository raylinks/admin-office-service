import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import { QueryFiatTransactionsDto, SetFiatTradeRateDto } from './fiat.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class FiatService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    @Inject(RMQ_NAMES.FIAT_SERVICE) private fiatClient: ClientRMQ,
    private prisma: PrismaClient,
  ) { }

  async fetchAllTransactions(query: QueryFiatTransactionsDto) {
    return await lastValueFrom(
      this.walletClient.send(
        { cmd: 'fetch.transactions' },
        {
          isFiat: true,
          ...query,
        },
      ),
    );
  }

  async fetchBalance() {
    return await lastValueFrom(
      this.walletClient.send({ cmd: 'fiat.balance.fetch' }, { isFiat: true }),
    );
  }

  async fetchOneTransaction(id: string) {
    return await lastValueFrom(
      this.walletClient.send({ cmd: 'transaction.get' }, id),
    );
  }

  async fetchRates() {
    return await lastValueFrom(
      this.walletClient.send({ cmd: 'fiat.rates.get' }, {}),
    );
  }

  async setFiatRates(operatorId: string, data: SetFiatTradeRateDto) {
    this.walletClient.emit({ cmd: 'fiat.rates.set' }, data);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.ENABLE_CRYPTO,
        operatorId,
        details: `${data.fiatSymbol} rate set by ${operatorId}`,
      },
    });
  }
}
