import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import config from 'src/config';
import { PrismaClient } from '@prisma/client';
import { HttpModule } from '@nestjs/axios';
import { HttpResponse } from 'src/reponses/http.response';
import { JwtStrategy } from 'src/strategies/jwt.strategy';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaClient, HttpResponse, JwtStrategy],
})
export class AuthModule {}
