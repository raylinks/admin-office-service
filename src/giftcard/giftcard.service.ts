import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { RMQ_NAMES } from 'src/utils/constants';
import { CreateGiftCardDto, SetCardRateDto } from './dto/giftcard.dto';
import { AuditLogAction, PrismaClient } from '@prisma/client';
import { lastValueFrom, timeout } from 'rxjs';

@Injectable()
export class GiftcardService {
  private readonly logger = new Logger(GiftcardService.name);
  constructor(
    private prisma: PrismaClient,
    @Inject(RMQ_NAMES.GIFTCARD_SERVICE) private giftcardClient: ClientRMQ,
  ) {}

  async createCard(operatorId: string, data: CreateGiftCardDto) {
    this.giftcardClient.emit('giftcard.create', data).pipe(timeout(5_000));

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Added a new giftcard details for ${data.card.card}`,
      },
    });
  }

  async fetchAllCards() {
    const cards = await lastValueFrom(
      this.giftcardClient.send('giftcard.all', {}),
    );

    return cards;
  }

  async fetchCard(cardId: string) {
    const card = await lastValueFrom(
      this.giftcardClient.send('giftcard.details', cardId),
    );

    return card;
  }

  async disableCard(operatorId: string, cardId: string) {
    this.giftcardClient.emit('giftcard.disable', cardId);

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Disabled giftcard \n id: ${cardId}`,
      },
    });
  }

  async setCardRate(operatorId: string, data: SetCardRateDto) {
    this.giftcardClient.emit('giftcard.rate.set', data);

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Rate set for giftcard\n ${data}`,
      },
    });

    return await this.fetchCard(data.cardId);
  }

  async deleteCardNumber(operatorId: string, numberId: string) {
    this.giftcardClient.emit('giftcard.delete.number', numberId);

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Card number deleted\n id: ${numberId}`,
      },
    });
  }

  async deleteCardDenomination(operatorId: string, denominationId: string) {
    this.giftcardClient.emit('giftcard.delete.denomination', denominationId);

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Card denomination deleted\n id: ${denominationId}`,
      },
    });
  }

  async deleteCardReceipt(operatorId: string, receiptId: string) {
    this.giftcardClient.emit('giftcard.delete.reciept', receiptId);

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Card receipt deleted\n id: ${receiptId}`,
      },
    });
  }

  async deleteCardCurrency(operatorId: string, currencyId: string) {
    this.giftcardClient.emit('giftcard.delete.currency', currencyId);

    await this.prisma.auditLog.create({
      data: {
        action: AuditLogAction.GIFTCARD_CREATE,
        operatorId,
        details: `Card currency deleted\n id: ${currencyId}`,
      },
    });
  }
}
