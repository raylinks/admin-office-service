import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';
import { decrypt, encrypt } from 'src/utils';
import { ICreateAccount } from './dto/account.dto';
import { IGoogleProfile } from 'src/google/google.guard';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaClient, private jwt: JwtService) { }

  async login(data: IGoogleProfile) {
    let user = await this.findByEmail(data.email.toLowerCase());
    if (!user)
      user = await this.getOrCreateAccount({
        avatar: data.picture,
        fullName: data.name,
        email: data.email,
        emailVerified: data.email_verified,
      });

    const token = this.createAuthToken(user.id);

    return { token, user };
  }

  async findById(id: string) {
    return await this.prisma.user
      .findUniqueOrThrow({
        where: { id },
        include: {
          role: true,
        },
      })
      .catch(() => {
        throw new NotFoundException('User not found');
      });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });
  }

  async verify2fa(userId: string, token: string) {
    const user = await this.findById(userId);
    if (!user.authEnabled) throw new BadRequestException('2fa not enabled');

    await this.verify2FaToken(userId, token);

    return user;
  }

  async enable2fa(userId: string) {
    const user = await this.findById(userId);
    if (user.authEnabled) throw new BadRequestException('2FA enabled already');

    return await this.create2FA(user.id, user.email.toLowerCase());
  }

  async complete2fa(userId: string, token: string) {
    const user = await this.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    await this.verify2FaToken(user.id, token);

    await this.prisma.user.update({
      where: { id: userId },
      data: { authEnabled: true },
    });

    return await this.findById(userId);
  }

  async disable2fa(userId: string) {
    const user = await this.findById(userId);
    if (!user.authEnabled)
      throw new BadRequestException('2FA Disabled Already');

    await this.prisma.$transaction(async (prisma: PrismaClient) => {
      await prisma.auth.delete({
        where: { userId: user.id },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { authEnabled: false },
      });
    });

    return await this.findById(userId);
  }

  private createAuthToken(userId: string) {
    return this.jwt.sign({ userId });
  }

  private async getOrCreateAccount(data: ICreateAccount) {
    const user = await this.findByEmail(data.email.toLowerCase());
    if (user) return user;

    return await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        avatar: data.avatar,
        emailVerified: data.emailVerified,
        role: {
          connect: {
            namw: 'OPERATION',
          },
        },
      },
    });
  }

  private async saveAuthSecret(userId: string, secret: string) {
    const auth = await this.prisma.auth.findFirst({ where: { userId } });
    if (auth) await this.prisma.auth.delete({ where: { id: auth.id } });

    return await this.prisma.auth.create({
      data: {
        secret: encrypt(secret),
        userId,
      },
    });
  }

  private async verify2FaToken(userId: string, token: string) {
    const auth = await this.prisma.auth.findFirst({
      where: { userId },
    });
    if (!auth) throw new NotFoundException('auth token not found');
    const secret = decrypt(auth.secret);

    const verified = authenticator.verify({ token, secret });
    if (!verified) {
      throw new BadRequestException('invalid authenticator code');
    }
  }

  private async create2FA(userId: string, email: string) {
    const secret = authenticator.generateSecret();
    await this.saveAuthSecret(userId, secret);

    const otpUrl = authenticator.keyuri(email, 'furex', secret);

    return { secret, otpUrl };
  }
}
