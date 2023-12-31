import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FiatService } from './fiat.service';
import { HttpResponse } from 'src/reponses/http.response';
import { Response } from 'express';
import { QueryFiatTransactionsDto, SetFiatTradeRateDto } from './fiat.dto';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { GetAccount } from 'src/decorators/account.decorator';

@Controller('fiat')
@UseGuards(JwtAuthGuard)
@ApiTags('Fiat')
@ApiSecurity('auth')
export class FiatController {
  constructor(
    private readonly fiatService: FiatService,
    private response: HttpResponse,
  ) {}

  @Get('balance')
  async fetchCryptoBalance(@Res() res: Response) {
    const balance = await this.fiatService.fetchBalance();

    return this.response.okResponse(
      res,
      'Crypto balance fetched successfully',
      balance,
    );
  }

  @Get('transactions')
  async fetchAllTransactions(
    @Query() query: QueryFiatTransactionsDto,
    @Res() res: Response,
  ) {
    const transactions = await this.fiatService.fetchAllTransactions(query);

    return this.response.okResponse(
      res,
      'Transactions fetched successfully',
      transactions,
    );
  }

  @Get('transactions/export/excel')
  async exportAllTransactions(
    @Query() query: QueryFiatTransactionsDto,
    @Res() res: Response,
  ) {
    return await this.fiatService.exportAllTransactions(res, query);
  }

  @Get('transactions/:id')
  async fetchOneTransaction(@Param('id') id: string, @Res() res: Response) {
    const transaction = await this.fiatService.fetchOneTransaction(id);

    return this.response.okResponse(
      res,
      'Transaction fetched successfully',
      transaction,
    );
  }

  @Get('transactions/:id')
  async fetchRates(@Param('id') id: string, @Res() res: Response) {
    const transaction = await this.fiatService.fetchOneTransaction(id);

    return this.response.okResponse(
      res,
      'Transaction fetched successfully',
      transaction,
    );
  }

  @Get('transactions/:id/export/excel')
  async exportOneTransactions(@Param('id') id: string, @Res() res: Response) {
    return await this.fiatService.exportOneTransactions(res, id);
  }

  @Put('set-rate')
  async setTradeRate(
    @GetAccount() profile: { userId: string },
    @Body() data: SetFiatTradeRateDto,
    @Res() res: Response,
  ) {
    await this.fiatService.setFiatRates(profile.userId, data);
    return this.response.okResponse(res, 'Trade rate set successfully');
  }

  @Get('rates')
  async fetchTradeRates(@Res() res: Response) {
    const rates = await this.fiatService.fetchRates();
    return this.response.okResponse(res, 'Trade rates fetched successfully', {
      rates,
    });
  }
}
