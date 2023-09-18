import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import { QueryFiatTransactionsDto, SetFiatTradeRateDto } from './fiat.dto';
import { lastValueFrom } from 'rxjs';
import { ExcelService } from 'src/exports/excel.service';
import { Pool } from 'mysql2/promise';

@Injectable()
export class FiatService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    private prisma: PrismaClient,
    private excelService: ExcelService,
    @Inject('WALLET_SERVICE_DATABASE_CONNECTION') private walletDB: Pool,
  ) {}

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

  async exportAllTransactions(res, query: QueryFiatTransactionsDto) {
    const { transactions } = await this.fetchAllTransactions(query);
    return await this.excelService.export(res, transactions, 'fiat', 'bulk');
  }

  async fetchBalance() {
    return await lastValueFrom(
      this.walletClient.send({ cmd: 'fiat.balance.fetch' }, { isFiat: true }),
    );
  }

  async fetchOneTransaction(id: string) {
    try {
      const [result] = await this.walletDB.query(
        `SELECT * FROM transactions WHERE id = ? LIMIT 1`,
        [id],
      );
      const transaction = result[0];
      if (!transaction) throw new NotFoundException('Transaction Not Found');

      return transaction;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async exportOneTransactions(res, id: string) {
    const transaction = await this.fetchOneTransaction(id);
    return await this.excelService.export(res, transaction, 'fiat', 'single');
  }

  async fetchRates() {
    const [rates] = await this.walletDB.query(
      `SELECT * FROM trade_rates ORDER BY created_at DESC`,
    );

    return rates;
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
    try {
      const [result] = await this.walletDB.query(
        `SELECT * FROM trade_rates WHERE fiat_symbol = ? ORDER BY created_at DESC LIMIT 1`,
        [data.fiatSymbol],
      );
      let rate = result[0];
      if (!rate) {
        await this.walletDB.execute(
          `
          INSERT INTO trade_rates (
            id, buy_rate, sell_rate, fiat_symbol, created_at
          ) VALUES (UUID(), ?, ?, ?, NOW())`,
          [data.buyRate || 0, data.sellRate || 0, data.fiatSymbol],
        );
      } else {
        await this.walletDB.execute(
          `UPDATE trade_rates SET buy_rate=?, sell_rate=?, updated_at=NOW() WHERE id = ?`,
          [data.buyRate || 0, data.sellRate || 0, rate.id],
        );
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
