import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { HttpResponse } from 'src/reponses/http.response';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DB_NAMES, QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';
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
    ]),
  ],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    HttpResponse,
    {
      provide: DB_NAMES.WALLET,
      useFactory: async () => {
        return createPool(config.db.walletService);
      },
    },
  ],
})
export class CustomerModule {}
