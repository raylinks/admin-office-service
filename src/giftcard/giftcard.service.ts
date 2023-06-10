import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { RMQ_NAMES } from 'src/utils/constants';
import { CreateGiftCardDto } from './dto/giftcard.dto';
import { AuditLogAction, PrismaClient } from '@prisma/client';
import { lastValueFrom, timeout } from 'rxjs';

@Injectable()
export class GiftcardService {
  constructor(
    private prisma: PrismaClient,
    @Inject(RMQ_NAMES.GIFTCARD_SERVICE) private giftcardClient: ClientRMQ,
  ) { }

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
      this.giftcardClient.send('giftcard.details', cardId).pipe(timeout(5_000)),
    );

    return card;
  }

  async deleteCardDetails() { }
}
