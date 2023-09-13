import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import { QueryFiatTransactionsDto, SetFiatTradeRateDto } from './fiat.dto';
import { lastValueFrom } from 'rxjs';
import { ExcelService } from 'src/exports/excel.service';

@Injectable()
export class FiatService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    private prisma: PrismaClient,
    private excelService: ExcelService, 
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

  async exportAllTransactions(query: QueryFiatTransactionsDto){
    const {transactions} = await this.fetchAllTransactions(query);
    return await this.excelService.export(transactions, 'fiat', 'bulk');
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

  async exportOneTransactions(id: string){
    const transaction = await this.fetchOneTransaction(id);
    return await this.excelService.export(transaction, 'fiat', 'single');
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
