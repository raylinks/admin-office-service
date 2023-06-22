import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { HttpResponse } from './reponses/http.response';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private response: HttpResponse,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('countries')
  async fetchCountries(@Res() res: Response) {
    const countries = await this.appService.fetchCountries();

    return this.response.okResponse(res, 'fetched all countries', countries);
  }

  @Get('currencies')
  async fetchCurrencies(@Res() res: Response) {
    const currencies = await this.appService.fetchCurrencies();

    return this.response.okResponse(res, 'fetched all currencies', currencies);
  }
}
