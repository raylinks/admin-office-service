import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { PrismaClient } from '@prisma/client';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DB_NAMES, QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';
import { HttpResponse } from 'src/reponses/http.response';
import { createPool } from 'mysql2/promise';
import { ExcelService } from 'src/exports/excel.service';

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
    ExcelService,
    {
      provide: DB_NAMES.GIFTCARD,
      useFactory: async () => {
        return createPool(config.db.giftCardService);
      },
    },
  ],
})
export class TradeModule {}
