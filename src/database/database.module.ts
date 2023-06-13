import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { createPool, Pool } from 'mysql2';
import config from 'src/config';
import { parseDbUrl } from './database.util';
import { ModuleRef } from '@nestjs/core';

const walletService = async () => {
  return createPool({
    ...parseDbUrl(config.db.walletService),
    waitForConnections: true,
    connectionLimit: 15,
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
  constructor(private readonly moduleRef: ModuleRef) { }
  private readonly logger = new Logger(DatabaseModule.name);

  onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down on signal ${signal}`);
    const pool = this.moduleRef.get('WALLET_DB_CONNECTION') as Pool;
    return pool.end();
  }
}
