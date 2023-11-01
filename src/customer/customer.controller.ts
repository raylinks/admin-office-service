import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { HttpResponse } from 'src/reponses/http.response';
import { Response } from 'express';
import { ApiOkResponse, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CURRENCY } from 'src/utils/constants';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { FetchWalletBalanceResponseDto } from './dto/customer.dto';

@Controller('customer')
@ApiTags('Customer')
@UseGuards(JwtAuthGuard)
@ApiSecurity('auth')
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private response: HttpResponse,
  ) {}

  @Get(':id/balance')
  @ApiQuery({ name: 'currency', required: false, enum: ['USD', 'NGN'] })
  @ApiOkResponse({ type: FetchWalletBalanceResponseDto })
  async fetchWalletBalance(
    @Param('id') id: string,
    @Query('currency') currency: CURRENCY,
    @Res() res: Response,
  ) {
    const balance = await this.customerService.fetchWalletBalance(id, currency);

    return this.response.okResponse(
      res,
      'Balance Fetched Successfully',
      balance,
    );
  }

  @Get(':id/transactions')
  fetchTransactions(
    @Param('id') id: string,
    @Query('currency') currency: string,
    @Res() res: Response,
  ) {}
}
