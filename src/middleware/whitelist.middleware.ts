import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';


import { Logger } from '@nestjs/common';

const logger = new Logger('MaintenanceMiddleware');
@Injectable()
export class WhitelistMiddleware

  implements NestMiddleware
{
  private readonly maintenanceMode: boolean = process.env.MAINTENANCE_MODE == 'true';
   private readonly emailWhitelist: string[] =
process.env.WHITElIST_EMAILS.split(',') || [];

  constructor(private readonly jwtService: JwtService) {
  }

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    const allowedPaths = [
      
    ];

    if (!allowedPaths.includes(req.originalUrl)) {
      let email = '';
      if (!token) {
        // Handle missing or invalid token
        email = req.body?.email;
      } else {
        try {
          const decodedToken: any = this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET,
            ignoreExpiration: true,
          });

          email = decodedToken.password;
        } catch (err) {
          logger.error(err, 'JWT ERROR');
          // Handle invalid or expired token
          // return res.status(401).send(this.sendFailedResponse({}, 'Your session has expired.Please log in again.'));
        }
      }

      if (this.maintenanceMode) {
        if (!email || !this.emailWhitelist.includes(email)) {
          // Handle unauthorized access for users not on the whitelist
          throw new BadRequestException(
            'The app is currently in maintenance mode.Please try again later.',
          );
        }
      }
    }

    next();
  }
}
