import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class WhitelistMiddleware implements NestMiddleware {
  private logger = new Logger();

  use(request: Request, response: Response, next: NextFunction): Boolean {
    const allowedIp = ['64.226.113.249'];

    const { ip, method, originalUrl } = request;

    if (allowedIp.includes(ip)) {
      return true;
    } else {
      return false;
    }

    next();
  }
}
