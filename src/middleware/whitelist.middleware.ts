import { BadRequestException, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as requestIp from 'request-ip';

@Injectable()
export class WhitelistMiddleware implements NestMiddleware {
  private logger = new Logger();

  use(request: Request, response: Response, next: NextFunction) {
    const allowedIp = process.env.WHITELISTED_IPS;
    console.log("enb-ip", process.env.WHITELISTED_IPS);

    // const { ip, method, originalUrl } = request;

    // console.log('ip', ip);
    // console.log('lp', Lp);
    try{
    fetch('https://json.geoiplookup.io/')
      .then(data => data.json())
      .then(data => {
        let ip = data.ip ?? data.hostname
         console.log('ip', ip);
        if (allowedIp.includes(ip)) {
          console.log("true");
          next();
        } else {
          console.log("false");
          throw new BadRequestException('You can not access this request at this moment, try again later.');
        }
      });
    }catch(err)
    {
      throw new BadRequestException('You can not access this request at this moment, try again later.');
    }
    // if (allowedIp.includes(ip)) {
    //    console.log("true");
    //   next();
    // } else {
    //   console.log("false");
    // throw new BadRequestException('You can not access this request at this moment, try again later.');
    // }

  }

}
