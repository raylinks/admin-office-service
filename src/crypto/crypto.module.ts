import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { HttpResponse } from 'src/reponses/http.response';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';
import { PrismaClient } from '@prisma/client';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
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
  controllers: [CryptoController],
  providers: [CryptoService, HttpResponse, PrismaClient],
})
export class CryptoModule {}
