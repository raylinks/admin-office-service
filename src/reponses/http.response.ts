import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class HttpResponse {
  createdResponse(
    res: Response,
    message: string,
    data?: Record<string, unknown>,
  ) {
    return res.status(HttpStatus.CREATED).send({
      success: true,
      statusCode: HttpStatus.CREATED,
      message,
      data,
    });
  }

  okResponse(res: Response, message: string, data?: any) {
    return res.status(HttpStatus.OK).send({
      success: true,
      statusCode: HttpStatus.OK,
      message,
      data,
    });
  }
}
