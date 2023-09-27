import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import { CreateGiftCardDto, SetCardRateDto } from './dto/giftcard.dto';
import { PrismaClient } from '@prisma/client';
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
        action: AUDIT_ACTIONS.GIFTCARD_CREATED,
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
        action: AUDIT_ACTIONS.GIFTCARD_DISABLED,
        operatorId,
        details: `Disabled giftcard \n id: ${cardId}`,
      },
    });
  }

  async enableCard(operatorId: string, cardId: string) {
    this.giftcardClient.emit('giftcard.enable', cardId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_DISABLED,
        operatorId,
        details: `Enabled giftcard \n id: ${cardId}`,
      },
    });
  }

  async setCardRate(operatorId: string, data: SetCardRateDto) {
    this.giftcardClient.emit('giftcard.rate.set', data);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_RATE_SET,
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
        action: AUDIT_ACTIONS.GIFTCARD_UPDATED,
        operatorId,
        details: `Card number deleted\n id: ${numberId}`,
      },
    });
  }

  async deleteCardDenomination(operatorId: string, denominationId: string) {
    this.giftcardClient.emit('giftcard.delete.denomination', denominationId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_DELETED,
        operatorId,
        details: `Card denomination deleted\n id: ${denominationId}`,
      },
    });
  }

  async deleteCardReceipt(operatorId: string, receiptId: string) {
    this.giftcardClient.emit('giftcard.delete.reciept', receiptId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_DELETED,
        operatorId,
        details: `Card receipt deleted\n id: ${receiptId}`,
      },
    });
  }

  async deleteCardCurrency(operatorId: string, currencyId: string) {
    this.giftcardClient.emit('giftcard.delete.currency', currencyId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_DELETED,
        operatorId,
        details: `Card currency deleted\n id: ${currencyId}`,
      },
    });
  }

  /// giftcard buy services

  async createCardBuy(operatorId: string, data: CreateGiftCardDto) {
    this.giftcardClient.emit('giftcard.buy.create', data).pipe(timeout(5_000));

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_CREATED,
        operatorId,
        details: `Added a new giftcard details for ${data.card.card}`,
      },
    });
  }

  async fetchAllCardBuys() {
    const cards = await lastValueFrom(
      this.giftcardClient.send('giftcard.buy.all', {}),
    );

    return cards;
  }

  async fetchCardBuy(cardId: string) {
    const card = await lastValueFrom(
      this.giftcardClient.send('giftcard.buy.details', cardId),
    );

    return card;
  }

  async disableCardBuy(operatorId: string, cardId: string) {
    this.giftcardClient.emit('giftcard.buy.disable', cardId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_DISABLED,
        operatorId,
        details: `Disabled giftcard \n id: ${cardId}`,
      },
    });
  }

  async enableCardBuy(operatorId: string, cardId: string) {
    this.giftcardClient.emit('giftcard.buy.enable', cardId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_DISABLED,
        operatorId,
        details: `Enabled giftcard \n id: ${cardId}`,
      },
    });
  }

  async setCardBuyRate(operatorId: string, data: SetCardRateDto) {
    this.giftcardClient.emit('giftcard.buy.rate.set', data);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_RATE_SET,
        operatorId,
        details: `Rate set for giftcard\n ${data}`,
      },
    });

    return await this.fetchCard(data.cardId);
  }

  async deleteCardBuyNumber(operatorId: string, numberId: string) {
    this.giftcardClient.emit('giftcard.buy.delete.number', numberId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_UPDATED,
        operatorId,
        details: `Card number deleted\n id: ${numberId}`,
      },
    });
  }

  async deleteCardBuyDenomination(operatorId: string, denominationId: string) {
    this.giftcardClient.emit('giftcard.buy.delete.denomination', denominationId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_DELETED,
        operatorId,
        details: `Card denomination deleted\n id: ${denominationId}`,
      },
    });
  }

  async deleteCardBuyReceipt(operatorId: string, receiptId: string) {
    this.giftcardClient.emit('giftcard.buy.delete.reciept', receiptId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_DELETED,
        operatorId,
        details: `Card receipt deleted\n id: ${receiptId}`,
      },
    });
  }

  async deleteCardBuyCurrency(operatorId: string, currencyId: string) {
    this.giftcardClient.emit('giftcard.buy.delete.currency', currencyId);

    await this.prisma.auditLog.create({
      data: {
        action: AUDIT_ACTIONS.GIFTCARD_DELETED,
        operatorId,
        details: `Card currency deleted\n id: ${currencyId}`,
      },
    });
  }
}
