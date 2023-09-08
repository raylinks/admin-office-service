import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { PrismaClient } from '@prisma/client';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';
import { HttpResponse } from 'src/reponses/http.response';
import { createPool } from 'mysql2/promise';

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
      {
        name: RMQ_NAMES.WALLET_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: config.rmq.urls,
          queue: QUEUE_NAMES.FUREX_WALLET_QUEUE,
        },
      },
    ]),
  ],
  controllers: [TradeController],
  providers: [
    TradeService,
    PrismaClient,
    HttpResponse,
    {
      provide: 'GIFTCARD_SERVICE_DATABASE_CONNECTION',
      useFactory: async () => {
        return createPool(process.env.GIFT_SERVICE_DATABASE_URL);
      },
    },
  ],
})
export class TradeModule {}
