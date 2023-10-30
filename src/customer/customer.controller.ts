import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { HttpResponse } from 'src/reponses/http.response';
import { Response } from 'express';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('customer')
@ApiTags('Customer')
// @UseGuards(JwtAuthGuard)
@ApiSecurity('auth')
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private response: HttpResponse,
  ) {}

  @Get(':id/balance')
  async fetchWalletBalance(@Param('id') id: string, @Res() res: Response) {
    const balance = await this.customerService.fetchWalletBalance(id);

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
