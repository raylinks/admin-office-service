import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
@Injectable()
export class WhitelistIpGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const allowedIp = ['64.226.113.249'];

    if (process.env.BACKEND_ENV === 'production') {
      const ip = request.connection.remoteAddress;
      Logger.log(ip, 'ACCESSED IP ADDRESS');
      if (allowedIp.includes(ip)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}
