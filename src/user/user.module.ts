import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';
import { Db, MongoClient } from 'mongodb';
import { HttpResponse } from 'src/reponses/http.response';

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
  controllers: [UserController],
  providers: [
    UserService,
    HttpResponse,
    {
      provide: 'USER_DB_CONNECTION',
      useFactory: async (): Promise<Db> => {
        const client = await MongoClient.connect(
          String(process.env.USERDATA_SERVICE_DATABASE_URL),
        );
        return client.db('auth_service');
      },
    },
  ],
})
export class UserModule {}
