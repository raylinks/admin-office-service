import { Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import { Db } from 'mongodb';
import { GetUsersDTO } from './dto/get-users.dto';
import { lastValueFrom } from 'rxjs';
import { ExportDataDto } from './dto/export-data.dto';
import { ExcelService } from 'src/exports/excel.service';
import { ResetIdetityDto } from './dto/identity.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_DB_CONNECTION') private userDb: Db,
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    @Inject(RMQ_NAMES.USERDATA_SERVICE) private userClient: ClientRMQ,
    @Inject(RMQ_NAMES.FIAT_SERVICE) private fiatClient: ClientRMQ,
    private excelService: ExcelService,
    private prisma: PrismaClient,
  ) {}

  async index(query: GetUsersDTO) {
    const users = await lastValueFrom(
      this.userClient.send({ cmd: 'admin.user' }, query),
    );
    return users;
  }

  async allUserForExport() {
    const users = await lastValueFrom(
      this.userClient.send({ cmd: 'admin.user.raw' }, {}),
    );
    return users;
  }

  async getUserById(id: string) {
    const user = await lastValueFrom(
      this.userClient.send('admin.account.id', { id }),
    );
    return user;
  }

  async exportUsers(payload: ExportDataDto) {
    const exportedUsers = await lastValueFrom(
      this.userClient.send('admin.user.export', payload),
    );
    return exportedUsers;
  }

  async exportFiatAssets(payload: ExportDataDto) {
    const exportedFiatAssets = await lastValueFrom(
      this.walletClient.send('admin.export.fiat', payload),
    );
    return exportedFiatAssets;
  }

  async exportCryptoAssets(payload: ExportDataDto) {
    const exportedCryptoAssets = await lastValueFrom(
      this.walletClient.send('admin.export.crypto', payload),
    );
    return exportedCryptoAssets;
  }

  async usersBalance(userId: string) {
    const balances = await lastValueFrom(
      this.walletClient.send('admin.wallet.balance', userId),
    );
    return balances;
  }

  async userWalletTransactions(id: string, payload, query) {
    const userTransaction = await lastValueFrom(
      this.walletClient.send('admin.transaction', { id, payload, query }),
    );
    return userTransaction;
  }

  async updateUserInformation(id: string, payload) {
    const upatedInfo = await lastValueFrom(
      this.userClient.send('admin.update.user-account', { id, payload }),
    );
    return upatedInfo;
  }

  async deleteUserAccount(id: string) {
    const deletedUser = await lastValueFrom(
      this.userClient.send('admin.delete.user-account', { id }),
    );
    return deletedUser;
  }

  async blacklistUserAccount(id: string, payload) {
    const blacklistedUser = await lastValueFrom(
      this.userClient.send('admin.blacklist.user-account', { id, payload }),
    );
    return blacklistedUser;
  }

  async disable2FA(id: string) {
    const disabledUser2FA = await lastValueFrom(
      this.userClient.send('admin.disable.2fa', { id }),
    );
    return disabledUser2FA;
  }

  async flagTransaction(id: string, payload) {
    const flaggedTransaction = await lastValueFrom(
      this.walletClient.send('admin.toggle.transaction', { id, payload }),
    );
    console.log('nb', flaggedTransaction);
    return flaggedTransaction;
  }

  async getTransactionId(id: string) {
    const transaction = await lastValueFrom(
      this.walletClient.send('admin.transaction.id', { id }),
    );
    return transaction;
  }

  async userBankAccounts(id: string) {
    const account = await lastValueFrom(
      this.fiatClient.send('admin.fiat.user.account', { id }),
    );
    return account;
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

  async resetUserIdentity(operatorId: string, data: ResetIdetityDto) {
    this.userClient.emit({ cmd: 'identity.user.reset' }, data);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.RESET_USER_IDENTITY_STATUS,
        operatorId,
        details: `Reset id type of ${data.idType} for user: ${data.userId}`,
      },
    });
  }

  async reverifyUserKycStatus(operatorId: string, data: ResetIdetityDto) {
    this.userClient.emit({ cmd: 'identity.user.verify' }, data);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.VERIFY_USER_IDENTITY_STATUS,
        operatorId,
        details: `Verified id type of ${data.idType} for user: ${data.userId}`,
      },
    });
  }
}
