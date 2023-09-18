import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { RMQ_NAMES } from 'src/utils/constants';
import { Db } from 'mongodb';
import { lastValueFrom } from 'rxjs';
import { QueryTradesDto } from 'src/trade/dto/trade.dto';
import { ExcelService } from 'src/exports/excel.service';

@Injectable()
export class FinanceService {
  constructor(
    @Inject('USER_DB_CONNECTION') private userDb: Db,
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    @Inject(RMQ_NAMES.USERDATA_SERVICE) private userClient: ClientRMQ,
    private excelService: ExcelService,
  ) {}

  async cryptoWallet() {
    try {
      const result = await lastValueFrom(
        this.walletClient.send('admin.ledger.crypto-wallets', true),
      );
      return result;
    } catch (error) {}
  }

  async deposit() {
    try {
      const result = await lastValueFrom(
        this.walletClient.send('admin.ledger.deposit', true),
      );
      return result;
    } catch (error) {}
  }

  async withdrawal() {
    try {
      const withdrawal = await lastValueFrom(
        this.walletClient.send('admin.ledger.withdrawal', true),
      );
      return withdrawal;
    } catch (error) {}
  }

  async swap() {
    try {
      const swap = await lastValueFrom(
        this.walletClient.send('admin.ledger.swap', true),
      );
      return swap;
    } catch (error) {}
  }

  async giftcardSell() {
    try {
      const swap = await lastValueFrom(
        this.walletClient.send('admin.ledger.giftcard-sell', true),
      );
      return swap;
    } catch (error) {}
  }

  async giftcardBuy() {
    try {
      const swap = await lastValueFrom(
        this.walletClient.send('admin.ledger.giftcard-buy', true),
      );
      return swap;
    } catch (error) {}
  }

  async exportDepositLedgers() {
    try {
      const exportedDeposits = await lastValueFrom(
        this.walletClient.send('admin.ledger.export.deposit', true),
      );
      return exportedDeposits;
    } catch (error) {}
  }

  async exportWithdrawalLedgers() {
    try {
      const exportedWithdrawals = await lastValueFrom(
        this.walletClient.send('admin.ledger.export.withdrawal', true),
      );
      return exportedWithdrawals;
    } catch (error) {}
  }

  async exportSwapLedgers() {
    try {
      const exportedSwaps = await lastValueFrom(
        this.walletClient.send('admin.ledger.export.swap', true),
      );
      return exportedSwaps;
    } catch (error) {}
  }

  async exportDepositLedgerInExcel(res) {
    const { deposits } = await this.deposit();
    return await this.excelService.export(res, deposits, 'deposits', 'bulk');
  }

  async exportWithdrawalLedgerInExcel(res) {
    const { withdrawal } = await this.withdrawal();
    return await this.excelService.export(res, withdrawal, 'withdrawal', 'bulk');
  }

  async exportSwapLedgerInExcel(res) {
    const { swap } = await this.swap();
    return await this.excelService.export(res, swap, 'swap', 'bulk');
  }
}