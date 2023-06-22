import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetAccount } from 'src/decorators/account.decorator';
import { HttpResponse } from 'src/reponses/http.response';
import {
  CryptoAssetType,
  QueryCryptoTransactionsDto,
  SetCryptoTransactionFeesDto,
} from './crypto.dto';
import { CryptoService } from './crypto.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';

@Controller('crypto')
@UseGuards(JwtAuthGuard)
@ApiTags('Crypto')
@ApiSecurity('auth')
export class CryptoController {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly response: HttpResponse,
  ) {}

  @Get('balance')
  async fetchCryptoBalance(@Res() res: Response) {
    const balance = await this.cryptoService.fetchBalance();

    return this.response.okResponse(
      res,
      'Crypto balance fetched successfully',
      balance,
    );
  }

  @Get('transactions')
  async fetchAllTransactions(
    @Query() query: QueryCryptoTransactionsDto,
    @Res() res: Response,
  ) {
    const transactions = await this.cryptoService.fetchAllTransactions(query);

    return this.response.okResponse(
      res,
      'Transactions fetched successfully',
      transactions,
    );
  }

  @Get('transactions/:id')
  async fetchOneTransaction(@Param('id') id: string, @Res() res: Response) {
    const transaction = await this.cryptoService.fetchOneTransaction(id);

    return this.response.okResponse(
      res,
      'Transaction fetched successfully',
      transaction,
    );
  }

  @Get('disable/:symbol')
  @ApiQuery({ name: 'type', enum: CryptoAssetType })
  async disableCrypto(
    @GetAccount() profile: { userId: string },
    @Param('symbol') symbol: string,
    @Query('type') type: CryptoAssetType,
    @Res() res: Response,
  ) {
    await this.cryptoService.disableAsset(profile.userId, {
      type,
      symbol,
    });

    return this.response.okResponse(res, 'Asset disabled successfully');
  }

  @Get('enable/:symbol')
  @ApiQuery({ name: 'type', enum: CryptoAssetType })
  async enableCrypto(
    @GetAccount() profile: { userId: string },
    @Param('symbol') symbol: string,
    @Query('type') type: CryptoAssetType,
    @Res() res: Response,
  ) {
    await this.cryptoService.enableAsset(profile.userId, {
      type,
      symbol,
    });

    return this.response.okResponse(res, 'Asset enabled successfully');
  }

  @Put('set-rate')
  async setCryptoRate(
    @GetAccount() profile: { userId: string },
    @Body() data: SetCryptoTransactionFeesDto,
    @Res() res: Response,
  ) {
    await this.cryptoService.setTransactionFees(profile.userId, data);
    return this.response.okResponse(res, 'Crypto rate set successfully');
  }

  @Get('rates')
  async fetchTradeRates(@Res() res: Response) {
    const rates = await this.cryptoService.fetchRates();
    return this.response.okResponse(res, 'Trade rates fetched successfully', {
      rates,
    });
  }
}
