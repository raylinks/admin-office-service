import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { excludeField } from 'src/utils';
import { IGoogleProfile } from './google.guard';

export const GetGoogleProfile = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as IGoogleProfile;

    return excludeField(user, ['exp', 'aud', 'iss', 'hd']);
  },
);
