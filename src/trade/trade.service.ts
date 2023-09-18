import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import {
  ApproveDeclineTradeDto,
  CreateMessage,
  CreateMessageDto,
  ExternalTransactionActionDto,
  QueryMessageDto,
  QueryTradesDto,
  SetTradeRateDto,
} from './dto/trade.dto';
import { lastValueFrom } from 'rxjs';
import { Pool } from 'mysql2/promise';
import { ExcelService } from 'src/exports/excel.service';

@Injectable()
export class TradeService {
  private readonly logger = new Logger(TradeService.name);

  constructor(
    private prisma: PrismaClient,
    @Inject(RMQ_NAMES.GIFTCARD_SERVICE) private giftcardClient: ClientRMQ,
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    @Inject('GIFTCARD_SERVICE_DATABASE_CONNECTION') private giftcardDB: Pool,
    private excelService: ExcelService, 
  ) {}

  async approveDeclineTrade(operatorId: string, data: ApproveDeclineTradeDto) {
    const trade = await this.fetchTradeDetails(data.tradeId);

    if (trade.status === 'APPROVED')
      throw new BadRequestException('Trade is already approved');
    if (trade.status === 'DECLINED')
      throw new BadRequestException('Trade is already declined');
    if (trade.status === 'CLOSED')
      throw new BadRequestException('Trade is already closed');

    this.giftcardClient.emit(
      `trade.state.${data.status.toLowerCase()}`,
      data.tradeId,
    );

    if (data.status === 'approve')
      await this.approveTrade(operatorId, trade, data.comment);
    if (data.status === 'decline')
      await this.declineTrade(operatorId, trade, data.comment);

    return this.fetchTradeDetails(data.tradeId);
  }

  async closeTrade(operatorId: string, tradeId: string) {
    const trade = await this.fetchTradeDetails(tradeId);
    if (trade.status === 'CLOSED')
      throw new BadRequestException('Trade is already marked as closed');

    this.giftcardClient.emit('trade.close', tradeId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.CLOSE_GIFTCARD_TRADE,
        operatorId,
        details: `Trade set as closed \n id: ${tradeId}`,
      },
    });
  }

  async listTrades(query?: QueryTradesDto) {
    const trades = await lastValueFrom(
      this.giftcardClient.send('trade.all', query),
    );

    return trades;
  }

  async exportAllTransactions(res, query?: QueryTradesDto){
    const {trades} = await this.listTrades(query);
    return await this.excelService.export(res, trades, 'trades', 'bulk');
  }

  

  async fetchTradeDetails(id: string) {
    const trade = await lastValueFrom(
      this.giftcardClient.send('trade.details.get', id),
    );
    if (!trade) throw new BadRequestException('Trade does not exist');

    if (trade.rate) {
      const creditAmount = trade.quantity * trade.denomination * trade.rate;
      Object.assign(trade, { creditAmount });
    }

    return trade;
  }

  async exportOneTransactions(res, id: string){
    const trade = await this.fetchTradeDetails(id);
    return await this.excelService.export(res, trade, 'trades', 'single');
  }


  async createMessage(operatorId: string, data: CreateMessageDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: operatorId },
    });

    const trade = await this.fetchTradeBySessionId(data.sessionId);

    if (trade.status === 'CLOSED')
      throw new BadRequestException('Trade is closed');

    this.giftcardClient.emit('trade.message.create', {
      files: data.files,
      sessionId: data.sessionId,
      text: data.text || null,
      user: {
        id: user.id,
        name: user.fullName,
        avatar: user.avatar,
      },
    });

    return this.fetchAllTradeMessages(trade.id);
  }

  async fetchAllTradeMessages(tradeId: string, query?: QueryMessageDto) {
    const messages = await lastValueFrom(
      this.giftcardClient.send('trade.message.all', { tradeId, query }),
    );
    return messages;
  }

  async setTradeRate(
    operatorId: string,
    tradeId: string,
    data: SetTradeRateDto,
  ) {
    const trade = await this.fetchTradeDetails(tradeId);

    this.giftcardClient.emit('trade.rate.set', { ...data, tradeId });

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.SET_CRYPTO_RATE,
        operatorId,
        details: `Trade rate set \n id: ${trade.id}`,
      },
    });

    return await this.fetchTradeDetails(tradeId);
  }

  private async approveTrade(operatorId: string, trade: any, comment: string) {
    if (!trade.rate) throw new BadRequestException('Trade rate is not set');

    const finalAmount = trade.quantity * trade.denomination * trade.rate;

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.APPROVE_GIFTCARD_TRADE,
        operatorId,
        details: `Set trade as approved \n id: ${trade.id}`,
      },
    });
    this.walletClient.emit('external-transaction-action', <
      ExternalTransactionActionDto
    >{
      thirdPartyTxId: trade.id,
      status: 'CONFIRMED',
      txType: 'GiftcardEvent',
      data: {
        note: comment || 'Giftcard trade approved',
        amount: finalAmount,
        symbol: 'NGN',
        userId: trade.userId,
      },
    });
  }

  private async declineTrade(operatorId: string, trade: any, comment: string) {
    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.DECLINE_GIFTCARD_TRADE,
        operatorId,
        details: `Set trade as approved
          id: ${trade.id}
          comment: ${comment}`,
      },
    });
  }

  async fetchTradeBySessionId(sessionId: string) {
    const [result] = await this.giftcardDB.query(
      `SELECT * FROM trades WHERE session_id = ?`,
      [sessionId],
    );
    const trade = result[0];
    if (!trade) throw new NotFoundException('Trade Not Found');

    return trade;
  }
}
