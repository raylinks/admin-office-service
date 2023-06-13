import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy, ClientRMQ } from '@nestjs/microservices';
import { AuditLogAction, PrismaClient } from '@prisma/client';
import { RMQ_NAMES } from 'src/utils/constants';
import {
  ApproveDeclineTradeDto,
  CreateMessageDto,
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
  ) {}

  async approveDeclineTrade(operatorId: string, data: ApproveDeclineTradeDto) {
    const trade = await lastValueFrom(
      this.giftcardClient.send(`trade.state.${data.status}`, data),
    );

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Set trade as ${data.status} \n id: ${trade.id}`,
      },
    });
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
      this.giftcardClient.send('trade.details', id),
    );
    if (!trade) throw new BadRequestException('Trade does not exist');

    return trade;
  }

  async createMessage(operatorId: string, data: CreateMessageDto) {}

  async fetchAllTradeMessages(tradeId: string) {}

  async setTradeRate(operatorId: string, data: SetTradeRateDto) {}

  async fetchAllChats(tradeId: string) {}

  private async approveTrade(tradeId: string) {}

  private async declineTrade(tradeId: string, reason?: string) {}
}
