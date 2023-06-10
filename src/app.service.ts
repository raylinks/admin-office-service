import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

export interface ICountry {
  name: string;
  flag: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private http: HttpService) { }
  getHello(): string {
    return 'Hello World!';
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
      const country = {
        flag: data[code].flag,
        name: code,
      };
      countries.push(country);
    });

    return countries;
  }
}
