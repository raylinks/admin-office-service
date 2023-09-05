import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { RMQ_NAMES } from 'src/utils/constants';
import { Db } from 'mongodb';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class FinanceService {
  constructor(
    @Inject('USER_DB_CONNECTION') private userDb: Db,
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    @Inject(RMQ_NAMES.USERDATA_SERVICE) private userClient: ClientRMQ,
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
}
