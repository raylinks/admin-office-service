import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  private logger = new Logger(DatabaseService.name);

  constructor(
    @Inject('WALLET_DB_CONNECTION') private giftCardServicePool: Pool,
  ) {}

  // wallet db queries
}
