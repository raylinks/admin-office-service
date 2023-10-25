import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { AUDIT_ACTIONS, DB_NAMES, RMQ_NAMES } from 'src/utils/constants';
import { QueryFiatTransactionsDto, SetFiatTradeRateDto } from './fiat.dto';
import { lastValueFrom } from 'rxjs';
import { ExcelService } from 'src/exports/excel.service';
import { Pool } from 'mysql2/promise';
import * as cuid from 'cuid';

@Injectable()
export class FiatService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    private prisma: PrismaClient,
    private excelService: ExcelService,
    @Inject(DB_NAMES.WALLET) private walletDB: Pool,
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
      if (!transaction)
        throw new NotFoundException(`Transaction of id: ${id} not found`);

      return this.mapTransaction(transaction);
    } catch (err) {
      throw new InternalServerErrorException(
        'There was an error fetching transaction: err',
        err,
      );
    }
  }

  async exportOneTransactions(res, id: string) {
    const transaction = await this.fetchOneTransaction(id);
    return await this.excelService.export(res, transaction, 'fiat', 'single');
  }

  async fetchRates() {
    try {
      const [result] = await this.walletDB.query(`SELECT * FROM trade_rates`);
      const rates = result as any[];
      if (rates.length > 0)
        return rates.map((rate) => ({
          id: rate.id,
          buyRate: rate.buy_rate,
          sellRate: rate.sell_rate,
          fiatSymbol: rate.fiat_symbol,
          createdAt: rate.created_at,
          updatedAt: rate.updated_at,
        }));
      throw new BadRequestException("There's no trade rate set");
    } catch (err) {
      throw new InternalServerErrorException(
        'There was an issue fetching rates: err',
        err,
      );
    }
  }

  async setFiatRates(operatorId: string, data: SetFiatTradeRateDto) {
    try {
      const rates = await this.fetchRates();
      const rate = rates.find((rate) => rate.fiatSymbol === data.fiatSymbol);
      if (rate) {
        await this.walletDB.execute(
          `UPDATE trade_rates SET sell_rate=?, buy_rate=?, updated_at=NOW() WHERE id=?`,
          [
            data.sellRate || rate.sellRate,
            data.buyRate || rate.buyRate,
            rate.id,
          ],
        );
      } else {
        await this.walletDB.execute(
          `INSERT INTO trade_rates (id, buy_rate, sell_rate, fiat_symbol, created_at)
        VALUES (?,?,?,?,NOW())`,
          [cuid(), data.buyRate || 0, data.sellRate || 0, data.fiatSymbol],
        );
      }

      await this.prisma.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.ENABLE_CRYPTO,
          operatorId,
          details: `${data.fiatSymbol} rate set by ${operatorId}`,
        },
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        `There was an issue setting fiat rate: err: ${err}`,
      );
    }
  }

  private mapTransaction(transaction: any) {
    const formatAmount = (amount: number, isFiat: boolean) => {
      return parseFloat(isFiat ? amount.toFixed(2) : amount.toFixed(8));
    };

    const isFiat = transaction.is_fiat === 0 ? false : true;
    return {
      id: transaction.id,
      isFiat,
      userId: transaction.user_id,
      walletId: transaction.wallet_id,
      assetSymbol: transaction.asset_symbol,
      amount: formatAmount(transaction.amount, isFiat),
      cryptoAddress: transaction.crypto_ddress,
      memo: transaction.memo,
      type: transaction.type,
      status: transaction.status,
      creaedAt: transaction.created_at,
      updatedAt: transaction.updated_at,
      thirdPartyTxId: transaction.third_party_tx_id,
      swapEventId: transaction.swap_event_id,
      internalTransferEventId: transaction.internal_transfer_event_id,
      cryptoWithdrawalEventId: transaction.crypto_withdrawal_event_id,
      cryptoDepositEventId: transaction.crypto_deposit_event_id,
      fiatDepositEventId: transaction.fiat_deposit_event_id,
      fiatWithdrawalEventId: transaction.fiat_withdrawal_event_id,
      reversalEventId: transaction.reversal_event_id,
      eventType: transaction.eventType,
      eventId: transaction.eventId,
      buyEventId: transaction.buy_event_id,
      sellEventId: transaction.sell_event_id,
      nativeAssetSymbol: transaction.native_asset_symbol,
      giftCardEventId: transaction.giftCardEventId,
      newBalance: formatAmount(transaction.new_balance, isFiat),
      previousBalance: formatAmount(transaction.previous_balance, isFiat),
    };
  }
}
