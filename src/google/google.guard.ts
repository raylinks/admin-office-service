import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import config from 'src/config';

export interface IGoogleProfile {
  iss: string;
  aud: string;
  hd: 'myfurex.co';
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  exp: number;
}

@Injectable()
export class GoogleGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const user = await this.verifyGoogleCredential(req.body.credential);

    req.user = user;

    return true;
  }

  private async verifyGoogleCredential(token: string) {
    const profile = jwt.decode(token) as IGoogleProfile;

    if (profile.hd !== 'myfurex.co')
      throw new UnauthorizedException(
        'organization is restricted to public users',
      );

    if (
      !['https://accounts.google.com', 'accounts.google.com'].includes(
        profile.iss,
      )
    )
      throw new UnauthorizedException(
        'Please login with your authorized google account',
      );

    if (profile.aud !== config.oauth.clientId)
      throw new UnauthorizedException('Invalid token.');

    return profile;
  }
}
