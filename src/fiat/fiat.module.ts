import { Module } from '@nestjs/common';
import { FiatService } from './fiat.service';
import { FiatController } from './fiat.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQ_NAMES, QUEUE_NAMES, DB_NAMES } from 'src/utils/constants';
import config from 'src/config';
import { HttpResponse } from 'src/reponses/http.response';
import { PrismaClient } from '@prisma/client';
import { ExcelService } from 'src/exports/excel.service';
import { createPool } from 'mysql2/promise';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RMQ_NAMES.WALLET_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: config.rmq.urls,
          queue: QUEUE_NAMES.FUREX_WALLET_QUEUE,
        },
      },
      {
        name: RMQ_NAMES.FIAT_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: config.rmq.urls,
          queue: QUEUE_NAMES.FUREX_FIAT_QUEUE,
        },
      },
    ]),
  ],

  controllers: [FiatController],
  providers: [
    FiatService,
    HttpResponse,
    PrismaClient,
    ExcelService,
    {
      provide: DB_NAMES.WALLET,
      useFactory: async () => {
        return createPool(config.db.walletService);
      },
    },
  ],
})
export class FiatModule {}
