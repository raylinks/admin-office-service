import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { AuditLogAction, PrismaClient } from '@prisma/client';
import { RMQ_NAMES } from 'src/utils/constants';
import {
  ApproveDeclineTradeDto,
  CreateMessageDto,
  QueryMessageDto,
  QueryTradesDto,
  SetTradeRateDto,
} from './dto/trade.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TradeService {
  private readonly logger = new Logger(TradeService.name);

  constructor(
    private prisma: PrismaClient,
    @Inject(RMQ_NAMES.GIFTCARD_SERVICE) private giftcardClient: ClientRMQ,
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
  ) {}

  async approveDeclineTrade(operatorId: string, data: ApproveDeclineTradeDto) {
    const trade = await this.fetchTradeDetails(data.tradeId);

    if (!trade.rate && data.status === 'approve')
      throw new BadRequestException('Trade rate is not set');

    if (trade.status === 'APPROVED')
      throw new BadRequestException('Trade is already approved');
    if (trade.status === 'DECLINED')
      throw new BadRequestException('Trade is already declined');
    if (trade.status === 'CLOSED')
      throw new BadRequestException('Trade is already closed');

    this.giftcardClient.emit(`trade.state.${data.status}`, data.tradeId);

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Set trade as ${data.status} \n id: ${trade.id}`,
      },
    });

    if (data.status === 'approve') await this.approveTrade(trade, data.comment);

    return trade;
  }

  async closeTrade(operatorId: string, tradeId: string) {
    const trade = await this.fetchTradeDetails(tradeId);
    if (trade.status === 'CLOSED')
      throw new BadRequestException('Trade is already marked as closed');

    this.giftcardClient.emit('trade.close', tradeId);

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
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

  async fetchTradeDetails(id: string) {
    const trade = await lastValueFrom(
      this.giftcardClient.send('trade.details.get', id),
    );
    if (!trade) throw new BadRequestException('Trade does not exist');

    return trade;
  }

  async createMessage(operatorId: string, data: CreateMessageDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: operatorId },
    });

    const trade = await this.fetchTradeBySessionId(data.sessionId);

    if (trade.status === 'CLOSED')
      throw new BadRequestException('Trade is closed');

    this.giftcardClient.emit('trade.message.create', {
      ...data,
      user: {
        id: user.id,
        name: user.fullName,
        avatar: user.avatar,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `New message sent for trade \n id: ${trade.id}`,
      },
    });

    return await this.fetchAllTradeMessages(trade.id);
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
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Trade rate set \n id: ${trade.id}`,
      },
    });

    return await this.fetchTradeDetails(tradeId);
  }

  private async approveTrade(trade: any, comment: string) {
    const finalAmount = trade.quantity * trade.denomination * trade.rate;

    this.walletClient.emit('external-transaction-action', {
      thirdPartyTxId: trade.id,
      status: 'INIT',
      txType: 'GiftcardEvent',
      data: {
        note: comment || 'Giftcard trade approved',
        amount: finalAmount,
        symbol: 'NGN',
        userId: trade.userId,
      },
    });
  }

  async fetchTradeBySessionId(sessionId: string) {
    const trade = await lastValueFrom(
      this.giftcardClient.send('trade.session.get', sessionId),
    );
    if (!trade) throw new NotFoundException('Trade Not Found');

    return trade;
  }
}
