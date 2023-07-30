import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GiftcardModule } from './giftcard/giftcard.module';
import { TradeModule } from './trade/trade.module';
import { CryptoModule } from './crypto/crypto.module';
import { HttpModule } from '@nestjs/axios';
import { FiatModule } from './fiat/fiat.module';
import { HttpResponse } from './reponses/http.response';
import { BannerModule } from './banner/banner.module';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    UserModule,
    GiftcardModule,
    TradeModule,
    CryptoModule,
    FiatModule,
    BannerModule,
  ],
  controllers: [AppController],
  providers: [AppService, HttpResponse],
})
export class AppModule {}
