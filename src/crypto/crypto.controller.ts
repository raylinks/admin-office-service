import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
  SetCryptoTransactionRateDto,
  SetCryptoFees,
  UpdateCryptoTransactionFeeDto,
  EnableCryptoDto,
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
  ) { }

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

  @Get('transactions/export')
  async exportAllTransactions(
    @Query() query: QueryCryptoTransactionsDto,
    @Res() res: Response,
  ) {
    return await this.cryptoService.exportAllTransactions(res, query);
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

  @Get('transactions/:id/export')
  async exportOneTransactions(@Param('id') id: string, @Res() res: Response) {
    return await this.cryptoService.exportOneTransactions(res, id);
  }

  @Get('disable/:symbol')
  @ApiQuery({ name: 'type', enum: CryptoAssetType })
  async disableCrypto(
    @GetAccount() profile: { userId: string },
    @Body() data: EnableCryptoDto,
    @Param('symbol') symbol: string,
    @Res() res: Response,
  ) {
    await this.cryptoService.disableAsset(profile.userId, symbol, data);

    return this.response.okResponse(res, 'Asset disabled successfully');
  }

  @Post('enable/:symbol')
  async enableCrypto(
    @GetAccount() profile: { userId: string },
    @Body() data: EnableCryptoDto,
    @Param('symbol') symbol: string,
    @Res() res: Response,
  ) {
    await this.cryptoService.enableAsset(profile.userId, symbol, data);

    return this.response.okResponse(res, 'Asset enabled successfully');
  }

  @Put('set-rate')
  async setCryptoRate(
    @GetAccount() profile: { userId: string },
    @Body() data: SetCryptoTransactionRateDto,
    @Res() res: Response,
  ) {
    await this.cryptoService.setBuySellRate(profile.userId, data);
    return this.response.okResponse(res, 'Crypto rate set successfully');
  }

  @Put('set-fee')
  async setCryptoTransactionFees(
    @GetAccount() profile: { userId: string },
    @Body() data: UpdateCryptoTransactionFeeDto,
    @Res() res: Response,
  ) {
    await this.cryptoService.setCryptoTransactionFees(profile.userId, data);
    return this.response.okResponse(res, 'Crypto fees set successfully');
  }

  @Put('set-withdrawal-rate')
  async setWithdrawalRate(
    @GetAccount() profile: { userId: string },
    @Body() data: SetCryptoFees,
    @Res() res: Response,
  ) {
    await this.cryptoService.setWithdrawalRate(profile.userId, data);
    return this.response.okResponse(
      res,
      'Crypto Withdrawal rate set successfully',
    );
  }

  @Get('rates')
  async fetchTradeRates(@Res() res: Response) {
    const rates = await this.cryptoService.fetchRates();
    return this.response.okResponse(res, 'Crypto rates fetched successfully', {
      rates,
    });
  }

  @Get('fees')
  async fetchCryptoFees(@Res() res: Response) {
    const fees = await this.cryptoService.fetchFees();
    return this.response.okResponse(
      res,
      'Crypto fees fetched successfully',
      fees,
    );
  }

  @Get('fees/:symbol')
  async fetchCryptoFee(@Param('symbol') symbol: string, @Res() res: Response) {
    const fee = await this.cryptoService.fetchFee(symbol);
    return this.response.okResponse(
      res,
      'Crypto fees fetched successfully',
      fee,
    );
  }
}
