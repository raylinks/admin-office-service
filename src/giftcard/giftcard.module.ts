import { Module } from '@nestjs/common';
import { GiftcardService } from './giftcard.service';
import { GiftcardController } from './giftcard.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';
import { HttpResponse } from 'src/reponses/http.response';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RMQ_NAMES.GIFTCARD_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: config.rmq.urls,
          queue: QUEUE_NAMES.FUREX_GIFTCARD_QUEUE,
        },
      },
    ]),
  ],
  controllers: [GiftcardController],
  providers: [GiftcardService, HttpResponse, PrismaClient],
})
export class GiftcardModule { }
