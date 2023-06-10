import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GiftcardModule } from './giftcard/giftcard.module';
import { TradeModule } from './trade/trade.module';
import { CryptoModule } from './crypto/crypto.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthModule, UserModule, GiftcardModule, TradeModule, CryptoModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
