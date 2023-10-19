import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DB_NAMES, QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';
import { Db, MongoClient } from 'mongodb';
import { HttpResponse } from 'src/reponses/http.response';
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
        name: RMQ_NAMES.USERDATA_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: config.rmq.urls,
          queue: QUEUE_NAMES.FUREX_USERDATA_QUEUE,
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
  controllers: [FinanceController],
  providers: [FinanceService, ExcelService, HttpResponse],
})
export class FinanceModule {}
