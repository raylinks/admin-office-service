import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientKafka, ClientProxy, ClientRMQ } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { RMQ_NAMES } from 'src/utils/constants';
import { Db } from 'mongodb';
import { GetUsersDTO } from './dto/get-users.dto';
import { lastValueFrom } from 'rxjs';
import { ExportDataDto } from './dto/export-data.dto';
import { ExcelService } from 'src/exports/excel.service';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_DB_CONNECTION') private userDb: Db,
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    @Inject(RMQ_NAMES.USERDATA_SERVICE) private userClient: ClientRMQ,
    @Inject(RMQ_NAMES.FIAT_SERVICE) private fiatClient: ClientRMQ,
    private excelService: ExcelService,
  ) {}

  async index(query: GetUsersDTO) {
    try {
      const users = await lastValueFrom(
        this.userClient.send({ cmd: 'admin.user' }, query),
      );
      return users;
    } catch (error) {}
  }
  async allUserForExport() {
    try {
      const users = await lastValueFrom(
        this.userClient.send({ cmd: 'admin.user.raw' }, {}),
      );
      return users;
    } catch (error) {}
  }

  

  async getUserById(id: string) {
    try {
      const user = await lastValueFrom(
        this.userClient.send('admin.account.id', { id }),
      );
      return user;
    } catch (error) {}
  }

  async exportUsers(payload: ExportDataDto) {
    try {
      const exportedUsers = await lastValueFrom(
        this.userClient.send('admin.user.export', payload),
      );
      return exportedUsers;
    } catch (error) {}
  }

  async exportFiatAssets(payload: ExportDataDto) {
    try {
      const exportedFiatAssets = await lastValueFrom(
        this.walletClient.send('admin.export.fiat', payload),
      );
      return exportedFiatAssets;
    } catch (error) {}
  }

  async exportCryptoAssets(payload: ExportDataDto) {
    try {
      const exportedCryptoAssets = await lastValueFrom(
        this.walletClient.send('admin.export.crypto', payload),
      );
      return exportedCryptoAssets;
    } catch (error) {}
  }

  async usersBalance(userId: string) {
    try {
      const balances = await lastValueFrom(
        this.walletClient.send('admin.wallet.balance', userId),
      );
      return balances;
    } catch (error) {}
  }

  async userWalletTransactions(id: string, payload, query) {
    try {
      const userTransaction = await lastValueFrom(
        this.walletClient.send('admin.transaction', { id, payload, query }),
      );
      return userTransaction;
    } catch (error) {}
  }

  async updateUserInformation(id: string, payload) {
    try {
      const upatedInfo = await lastValueFrom(
        this.userClient.send('admin.update.user-account', { id, payload }),
      );
      return upatedInfo;
    } catch (error) {}
  }

  async deleteUserAccount(id: string) {
    try {
      const deletedUser = await lastValueFrom(
        this.userClient.send('admin.delete.user-account', { id }),
      );
      return deletedUser;
    } catch (error) {}
  }

  async blacklistUserAccount(id: string, payload) {
    try {
      const blacklistedUser = await lastValueFrom(
        this.userClient.send('admin.blacklist.user-account', { id, payload }),
      );
      return blacklistedUser;
    } catch (error) {}
  }

  async disable2FA(id: string) {
    try {
      const disabledUser2FA = await lastValueFrom(
        this.userClient.send('admin.disable.2fa', { id }),
      );
      return disabledUser2FA;
    } catch (error) {}
  }

  async flagTransaction(id: string, payload) {
    try {
      const flaggedTransaction = await lastValueFrom(
        this.walletClient.send('admin.toggle.transaction', { id, payload }),
      );
      console.log('nb', flaggedTransaction);
      return flaggedTransaction;
    } catch (error) {}
  }

  async getTransactionId(id: string) {
    try {
      const transaction = await lastValueFrom(
        this.walletClient.send('admin.transaction.id', { id }),
      );
      return transaction;
    } catch (error) {}
  }

  async userBankAccounts(id: string) {
    try {
      const account = await lastValueFrom(
        this.fiatClient.send('admin.fiat.user.account', { id }),
      );
      return account;
    } catch (error) {}
  }

  async exportAllUsersrInExcel(res) {
    const users = await this.allUserForExport();
    return await this.excelService.export(res, users, 'users', 'bulk');
  }

  async exportWalletTransactionInExcel(id: string, payload, query, res) {
    const { transactions } = await this.userWalletTransactions(
      id,
      payload,
      query,
    );
    return await this.excelService.export(
      res,
      transactions,
      'walletTransaction',
      'bulk',
    );
  }
}

