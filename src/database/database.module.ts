import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { parseDbUrl } from './database.util';
import { ModuleRef } from '@nestjs/core';
import { Pool, createConnection, createPool } from 'mysql2/promise';

const walletService = async () => {
  const opts = parseDbUrl(process.env.WALLET_SERVICE_DATABASE_URL);
  return createPool({
    host: opts.host,
    user: opts.username,
    password: opts.password,
    database: opts.database,
  });
};

@Module({
  providers: [
    DatabaseService,
    {
      provide: 'WALLET_DB_CONNECTION',
      useFactory: walletService,
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}
  private readonly logger = new Logger(DatabaseModule.name);

  onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down on signal ${signal}`);
    const pool = this.moduleRef.get('WALLET_DB_CONNECTION') as Pool;
    return pool.end();
  }
}
