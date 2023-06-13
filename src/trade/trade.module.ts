import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { PrismaClient } from '@prisma/client';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RMQ_NAMES.GIFTCARD_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: config.rmq.urls,
        },
      },
    ]),
  ],
  controllers: [TradeController],
  providers: [TradeService, PrismaClient],
})
export class TradeModule {}
