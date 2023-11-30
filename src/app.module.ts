import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { JwtModule } from '@nestjs/jwt';
import { VettingModule } from './vetting/vetting.module';
import { CustomerModule } from './customer/customer.module';
import { WhitelistMiddleware } from './middleware/whitelist.middleware';
import { UserController } from './user/user.controller';

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
    CustomerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, HttpResponse],
})
export class AppModule  {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(WhitelistMiddleware).forRoutes('*');
  // }
}

