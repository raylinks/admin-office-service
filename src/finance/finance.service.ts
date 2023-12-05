import { Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ExcelService } from 'src/exports/excel.service';
import { QueryLedgerDto } from './dto/finance.dto';
import { RMQ_NAMES } from 'src/utils/constants';

@Injectable()
export class FinanceService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
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

  async deposit(query: QueryLedgerDto) {
    try {
      const result = await lastValueFrom(
        this.walletClient.send('admin.ledger.deposit', query),
      );
      return result;
    } catch (error) {}
  }

  async withdrawal(query: QueryLedgerDto) {
    try {
      const withdrawal = await lastValueFrom(
        this.walletClient.send('admin.ledger.withdrawal', query),
      );
      return withdrawal;
    } catch (error) {}
  }

  async swap(query?: QueryLedgerDto) {
    
    const swapTrans = await lastValueFrom(
      this.walletClient.send('admin.ledger.swap', query),
    );
    
    return swapTrans;
  }

  async giftcardSell(query: QueryLedgerDto) {
    try {
      const giftcardSell = await lastValueFrom(
        this.walletClient.send('admin.ledger.giftcard-sell', query),
      );
      return giftcardSell;
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

  async exportDepositLedgerInExcel(res, query: QueryLedgerDto) {
    const { deposits } = await this.deposit(query);
    return await this.excelService.export(res, deposits, 'deposits', 'bulk');
  }

  async exportWithdrawalLedgerInExcel(res, query: QueryLedgerDto) {
    const { withdrawal } = await this.withdrawal(query);
    return await this.excelService.export(
      res,
      withdrawal,
      'withdrawal',
      'bulk',
    );
  }

  async exportSwapLedgerInExcel(res, query: QueryLedgerDto) {
    try {
      const {transactions} = await this.swap(query);
      return await this.excelService.export(
        res,
        transactions,
        'transactions',
        'bulk',
      );
    } catch (error) {
      console.log(error);
    }
  }
}
