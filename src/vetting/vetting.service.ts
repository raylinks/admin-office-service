import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { RMQ_NAMES, VETTING_STATUS } from 'src/utils/constants';

import { lastValueFrom } from 'rxjs';
import { ExcelService } from 'src/exports/excel.service';
import {
  ApproveDeclineWithdrawalDto,
  QueryVettingsDto,
} from './dto/vetting.dto';

@Injectable()
export class VettingService {
  constructor(
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    private excelService: ExcelService,
  ) {}

  /**
   * Fetch all transactions to eb vetted
   * @param query
   * @returns
   */
  async listVetting(query?: QueryVettingsDto) {
    query.limit = Number(query?.limit);
    query.page = Number(query?.page);
    const vettings = await lastValueFrom(
      this.walletClient.send({ cmd: 'fetch.vettings' }, query),
    );

    return vettings?.transactions;
  }

  /**
   * Fetch single vetting details
   *
   * @param id
   * @returns
   */
  async fetchVettingDetails(id: string) {
    const vetting = await lastValueFrom(
      this.walletClient.send({ cmd: 'vetting.details.get' }, id),
    );

    return vetting;
  }

  /**
   * Approve or reject withdrawal request
   * @param operatorId
   * @param data
   * @returns
   */
  async approveRejectWithdrawal(
    operatorId: string,
    data: ApproveDeclineWithdrawalDto,
  ) {
    const transaction = await this.fetchVettingDetails(data.transactionId);

    if (transaction.status === 'CONFIRMED')
      throw new BadRequestException('Withdrawal is already approved');
    if (transaction.status === 'CANCELLED')
      throw new BadRequestException('Withdrawal is already declined');

    if (data.status === 'approve')
      await this.approveWithdrawal(operatorId, transaction.transactionId);
    if (data.status === 'reject')
      await this.declineWithdrawal(operatorId, transaction.transactionId);

    return this.fetchVettingDetails(data.transactionId);
  }

  /**
   * Approve withdrawal
   * @param operatorId
   * @param transactionId
   */
  private async approveWithdrawal(operatorId: string, transactionId: string) {
    this.walletClient.emit(
      { cmd: 'vetting.action' },
      {
        operatorId,
        transactionId,
        status: VETTING_STATUS.APPROVE_WITHDRAWAL_REQUEST,
      },
    );
  }

  /**
   * Decline withdrawal
   * @param operatorId
   * @param transactionId
   */
  private async declineWithdrawal(operatorId: string, transactionId: string) {
    this.walletClient.emit(
      { cmd: 'vetting.action' },
      {
        operatorId,
        transactionId,
        status: VETTING_STATUS.REJECT_WITHDRAWAL_REQUEST,
      },
    );
  }

  /**
   * Export all vetting
   *
   * @param res
   * @param query
   * @returns
   */
  async exportAllTransactions(res, query?: QueryVettingsDto) {
    const vettings = await this.listVetting(query);
    return await this.excelService.export(res, vettings, 'vetting', 'bulk');
  }

  /**
   * Export single vetting
   *
   * @param res
   * @param id
   * @returns
   */
  async exportOneTransactions(res, id: string) {
    const withdrawal = await this.fetchVettingDetails(id);
    return await this.excelService.export(res, withdrawal, 'vetting', 'single');
  }
}
