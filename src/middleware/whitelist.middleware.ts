import { BadRequestException, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class WhitelistMiddleware implements NestMiddleware {
  private logger = new Logger();

  use(request: Request, response: Response, next: NextFunction) {
    const allowedIp = ['64.226.113.249'];

    const { ip, method, originalUrl } = request;

    if (allowedIp.includes(ip)) {
       console.log("true");
      next();
    } else {
      console.log("false");
    throw new BadRequestException('You can not access this request at this moment, try again later.');
    }
    
  }
}
