import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';
import { HttpResponse } from 'src/reponses/http.response';
import { ExcelService } from 'src/exports/excel.service';
import { VettingController } from './vetting.controller';
import { VettingService } from './vetting.service';

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
    ]),
  ],
  controllers: [VettingController],
  providers: [
    VettingService,
    PrismaClient,
    HttpResponse,
    ExcelService
  ],
}) 
export class VettingModule {}
