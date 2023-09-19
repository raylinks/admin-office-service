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
import { FinanceModule } from './finance/finance.module';
import { VettingModule } from './vetting/vetting.module';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    UserModule,
    FinanceModule,
    GiftcardModule,
    TradeModule,
    CryptoModule,
    FiatModule,
    BannerModule,
    VettingModule,
  ],
  controllers: [AppController],
  providers: [AppService, HttpResponse],
})
export class AppModule {}
