import { createParamDecorator } from '@nestjs/common';
import * as requestIp from 'request-ip';
export const IpAddress = createParamDecorator((data, req) => {
  
    const allowedIp = ['64.226.113.249'];

    if (req.clientIp && allowedIp.includes(req.clientIp)) {
      return  requestIp.getClientIp(req);;
    } else {
      return false;
    }

});
