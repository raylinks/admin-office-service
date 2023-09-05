import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Response } from 'express';
import { ApiOkResponse } from '@nestjs/swagger';
import { HttpResponse } from 'src/reponses/http.response';
import { FinanceService } from './finance.service';

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
  async deposit(@Res() res: Response) {
    const deposit = await this.financeService.deposit();
    return this.response.okResponse(
      res,
      'Fetched deposit ledgers successfully',
      deposit,
    );
  }

  @Get('ledger/withdrawal')
  async withdrawal(@Res() res: Response) {
    const withdrawal = await this.financeService.withdrawal();
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
}
