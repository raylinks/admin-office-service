import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import config from 'src/config';
import { HttpResponse } from 'src/reponses/http.response';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RMQ_NAMES.USERDATA_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: config.rmq.urls,
          queue: QUEUE_NAMES.FUREX_USERDATA_QUEUE,
        },
      },
    ]),
  ],
  controllers: [BannerController],
  providers: [BannerService, HttpResponse],
})
export class BannerModule {}
