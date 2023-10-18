import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { AUDIT_ACTIONS, RMQ_NAMES } from 'src/utils/constants';
import { CreateGiftCardDto, SetCardRateDto } from './dto/giftcard.dto';
import { PrismaClient } from '@prisma/client';
import { lastValueFrom, timeout } from 'rxjs';
import { Pool } from 'mysql2/promise';

@Injectable()
export class GiftcardService {
  constructor(
    private prisma: PrismaClient,
    @Inject(RMQ_NAMES.GIFTCARD_SERVICE) private giftcardClient: ClientRMQ,
    @Inject('GIFTCARD_SERVICE_DATABASE_CONNECTION') private giftcardDB: Pool,
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
    try {
      const [giftcard] = await this.giftcardDB.query(
        `SELECT id FROM cards WHERE id = ?`,
        [cardId],
      );
      if (!giftcard[0]) throw new NotFoundException('Giftcard does not exist');

      await this.giftcardDB.execute(
        `UPDATE cards SET is_disabled=1 WHERE id = ? LIMIT 1`,
        [cardId],
      );

      await this.prisma.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.GIFTCARD_DISABLED,
          operatorId,
          details: `Disabled giftcard \n id: ${cardId}`,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Operation: DISABLE_GIFTCARD failed',
        err,
      );
    }
  }

  async enableCard(operatorId: string, cardId: string) {
    try {
      const [giftcard] = await this.giftcardDB.query(
        `SELECT id FROM cards WHERE id = ?`,
        [cardId],
      );
      if (!giftcard[0]) throw new NotFoundException('Giftcard does not exist');

      await this.giftcardDB.execute(
        `UPDATE cards SET is_disabled=0 WHERE id = ? LIMIT 1`,
        [cardId],
      );

      await this.prisma.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.GIFTCARD_DISABLED,
          operatorId,
          details: `Enabled giftcard \n id: ${cardId}`,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Operation: ENABLE_GIFTCARD failed',
        err,
      );
    }
  }

  async setCardRate(operatorId: string, data: SetCardRateDto) {
    try {
      const [denomination] = await this.giftcardDB.query(
        `SELECT * FROM card_denominations WHERE id = ? LIMIT 1`,
        [data.denominationId],
      );
      if (!denomination[0])
        throw new NotFoundException('Denomination for card does not exist');

      await this.giftcardDB.execute(
        `UPDATE card_denominations SET rate= ? WHERE id = ? LIMIT 1`,
        [data.rate, data.denominationId],
      );

      await this.prisma.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.GIFTCARD_RATE_SET,
          operatorId,
          details: `Rate set for giftcard\n ${data}`,
        },
      });

      return await this.fetchCard(data.cardId);
    } catch (err) {
      throw new InternalServerErrorException(
        'Operation: SET_GIFCARD_RATE failed',
        err,
      );
    }
  }

  async deleteCardNumber(operatorId: string, numberId: string) {
    try {
      const [cardnumber] = await this.giftcardDB.query(
        `SELECT * FROM card_numbers WHERE id = ? LIMIT 1`,
        [numberId],
      );
      if (!cardnumber[0])
        throw new NotFoundException('Card Number for card does not exist');

      await this.giftcardDB.execute(`DELETE FROM card_numbers WHERE id = ?`, [
        numberId,
      ]);

      await this.prisma.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.GIFTCARD_UPDATED,
          operatorId,
          details: `Card number deleted\n id: ${numberId}`,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Operation: DELETE_CARD_NUMBER failed',
        err,
      );
    }
  }

  async deleteCardDenomination(operatorId: string, denominationId: string) {
    try {
      const [denomination] = await this.giftcardDB.query(
        `SELECT * FROM card_denominations WHERE id = ? LIMIT 1`,
        [denominationId],
      );
      if (!denomination[0])
        throw new NotFoundException(
          'Card Denomination for card does not exist',
        );

      await this.giftcardDB.execute(
        `DELETE FROM card_denominations WHERE id = ?`,
        [denominationId],
      );
      await this.prisma.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.GIFTCARD_DELETED,
          operatorId,
          details: `Card denomination deleted\n id: ${denominationId}`,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Operation: DELETE_CARD_DENOMINATION failed',
        err,
      );
    }
  }

  async deleteCardReceipt(operatorId: string, receiptId: string) {
    try {
      const [denomination] = await this.giftcardDB.query(
        `SELECT * FROM card_receipts WHERE id = ? LIMIT 1`,
        [receiptId],
      );
      if (!denomination[0])
        throw new NotFoundException('Card Receipt for card does not exist');

      await this.giftcardDB.execute(`DELETE FROM card_receipts WHERE id = ?`, [
        receiptId,
      ]);

      await this.prisma.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.GIFTCARD_DELETED,
          operatorId,
          details: `Card receipt deleted\n id: ${receiptId}`,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Operation: DELETE_CARD_RECEIPT failed',
        err,
      );
    }
  }

  async deleteCardCurrency(operatorId: string, currencyId: string) {
    try {
      const [currency] = await this.giftcardDB.query(
        `SELECT * FROM card_currencies WHERE id = ? LIMIT 1`,
        [currencyId],
      );
      if (!currency[0])
        throw new NotFoundException('Card Currency for card does not exist');

      await this.giftcardDB.execute(
        `DELETE FROM card_currencies WHERE id = ?`,
        [currencyId],
      );

      await this.prisma.auditLog.create({
        data: {
          action: AUDIT_ACTIONS.GIFTCARD_DELETED,
          operatorId,
          details: `Card currency deleted\n id: ${currencyId}`,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Operation: DELETE_CARD_CURRENCY failed',
        err,
      );
    }
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
    this.giftcardClient.emit(
      'giftcard.buy.delete.denomination',
      denominationId,
    );

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

  async fetchUserById(userId: string)
  {
    return await this.prisma.user.findFirst({
      where :{
        id: userId
      }
    })
  }
}
