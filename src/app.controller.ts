import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('countries')
  async fetchCountries() {
    const countries = await this.appService.fetchCountries();

    return countries;
  }

  @Get('currencies')
  async fetchCurrencies() {
    const currencies = await this.appService.fetchCurrencies();

    return currencies;
  }
}
