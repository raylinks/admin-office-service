import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

export interface ICountry {
  name: string;
  flag: string;
}

export interface ICurrency {
  currency: string;
  symbol: string;
  code: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private http: HttpService) { }
  getHello(): string {
    return 'Welcome Furexians! To the world of Crypto';
  }

  async fetchCountries() {
    const countries: ICountry[] = [];
    const { data } = await firstValueFrom(
      this.http
        .get('https://furex.fra1.digitaloceanspaces.com/countries.json')
        .pipe(
          catchError((err) => {
            this.logger.error(err);
            throw 'There was an error fetching countries';
          }),
        ),
    );

    const countryCodes = Object.keys(data);

    countryCodes.forEach((code) => {
      const country: ICountry = {
        flag: data[code].flag,
        name: code,
      };
      countries.push(country);
    });

    return countries;
  }

  async fetchCurrencies() {
    const currencies: ICurrency[] = [];
    const { data } = await firstValueFrom(
      this.http
        .get('https://furex.fra1.digitaloceanspaces.com/currencies.json')
        .pipe(
          catchError((err) => {
            this.logger.error(err);
            throw 'There was an error fetching countries';
          }),
        ),
    );

    const currencyCodes = Object.keys(data);

    currencyCodes.forEach((code) => {
      const currency: ICurrency = {
        currency: code,
        symbol: data[code].symbol,
        code: data[code].symbol,
      };
      currencies.push(currency);
    });

    return currencies;
  }
}
