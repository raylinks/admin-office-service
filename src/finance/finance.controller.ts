import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Response } from 'express';
import { ApiOkResponse } from '@nestjs/swagger';
import { HttpResponse } from 'src/reponses/http.response';
import { FinanceService } from './finance.service';
import { PassThrough } from 'stream';
import { QueryTradesDto } from 'src/trade/dto/trade.dto';
import { QueryLedgerDto } from './dto/finance.dto';

@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private response: HttpResponse,
  ) {}

  @Get('/ledger/wallet')
  async cryptoWallet(@Res() res: Response) {
    const ledgers = await this.financeService.cryptoWallet();
    return this.response.okResponse(
      res,
      'Fetched ledger successfully',
      ledgers,
    );
  }

  @Get('ledger/deposit')
  async deposit( @Query() query: QueryLedgerDto, @Res() res: Response) {
    const deposit = await this.financeService.deposit(query);
    return this.response.okResponse(
      res,
      'Fetched deposit ledgers successfully',
      deposit,
    );
  }

  @Get('ledger/withdrawal')
  async withdrawal( @Query() query: QueryLedgerDto, @Res() res: Response) {
    const withdrawal = await this.financeService.withdrawal(query);
    return this.response.okResponse(
      res,
      'Fetched withdrawal ledgers successfully',
      withdrawal,
    );
  }

  @Get('ledger/swap')
  async swap(@Res() res: Response) {
    const swap = await this.financeService.swap();
    return this.response.okResponse(
      res,
      'Fetched swap ledgers successfully',
      swap,
    );
  }

  @Get('ledger/giftcard-sell')
  async giftCardSell(@Res() res: Response) {
    const giftcardSell = await this.financeService.giftcardSell();
    return this.response.okResponse(
      res,
      'Fetched giftcard sell ledgers successfully',
      giftcardSell,
    );
  }

  @Get('ledger/giftcard-buy')
  async giftCardBuy(@Res() res: Response) {
    const giftcardBuy = await this.financeService.giftcardBuy();
    return this.response.okResponse(
      res,
      'Fetched giftcard buy ledgers successfully',
      giftcardBuy,
    );
  }

  @Get('/ledger/deposit/export')
  async exportDepositInCSV(@Res() res: Response) {
    const buffer = await this.financeService.exportDepositLedgers();

    const fileName = `furex_deposit_${Date.now()}.csv`;

    const readStream = new PassThrough();
    readStream.end(buffer);
    res.set({
      'Content-Type': 'text/csv',
      'Content-disposition': `attachment; filename=${fileName}`,
      'Content-Length': buffer.length,
    });
    readStream.pipe(res);
  }

  @Get('/ledger/withdraw/export')
  async exportWithdrawalInCSV(@Res() res: Response) {
    const buffer = await this.financeService.exportWithdrawalLedgers();

    const fileName = `furex_withdrawal_${Date.now()}.csv`;

    const readStream = new PassThrough();
    readStream.end(buffer);
    res.set({
      'Content-Type': 'text/csv',
      'Content-disposition': `attachment; filename=${fileName}`,
      'Content-Length': buffer.length,
    });
    readStream.pipe(res);
  }

  @Get('/ledger/swap/export')
  async exportSwapInCSV(@Res() res: Response) {
    const buffer = await this.financeService.exportSwapLedgers();

    const fileName = `furex_swap_${Date.now()}.csv`;

    const readStream = new PassThrough();
    readStream.end(buffer);
    res.set({
      'Content-Type': 'text/csv',
      'Content-disposition': `attachment; filename=${fileName}`,
      'Content-Length': buffer.length,
    });
    readStream.pipe(res);
  }

  @Get('/ledger/deposit/export/excel')
  async exportDepositLedgerInExcel( @Query() query: QueryLedgerDto, @Res() res: Response) {
    return await this.financeService.exportDepositLedgerInExcel(res, query);
  }

  @Get('/ledger/withdrawal/export/excel')
  async exportWithdrawalLedgerInExcel( @Query() query: QueryLedgerDto, @Res() res: Response) {
    return await this.financeService.exportWithdrawalLedgerInExcel(res, query);
  }

  @Get('/ledger/swap/export/excel')
  async exportSwapLedgerInExcel(@Res() res: Response) {
    return await this.financeService.exportSwapLedgerInExcel(res);
  }
}
