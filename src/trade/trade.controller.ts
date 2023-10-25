import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TradeService } from './trade.service';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { Response } from 'express';
import {
  ApproveDeclineTradeDto,
  CreateMessageDto,
  FetchAllTradesResponseDto,
  QueryMessageDto,
  QueryTradesDto,
  SetTradeRateDto,
} from './dto/trade.dto';
import { HttpResponse } from 'src/reponses/http.response';
import { GetAccount } from 'src/decorators/account.decorator';

@Controller('trades')
@ApiSecurity('auth')
@UseGuards(JwtAuthGuard)
@ApiTags('Trades')
export class TradeController {
  constructor(
    private readonly tradeService: TradeService,
    private response: HttpResponse,
  ) {}

  @Get('')
  @ApiOkResponse({ type: FetchAllTradesResponseDto })
  async fetchTrades(@Query() query: QueryTradesDto, @Res() res: Response) {
    const trades = await this.tradeService.listTrades(query);

    return this.response.okResponse(res, 'fetched all trades', trades);
  }

  @Get('count')
  async getTradeCount(@Res() res: Response) {
    const count = await this.tradeService.countTrades();
    return this.response.okResponse(res, '', count);
  }

  @Get('/export/excel')
  async exportAllTransactions(
    @Query() query: QueryTradesDto,
    @Res() res: Response,
  ) {
    return await this.tradeService.exportAllTransactions(res, query);
  }

  @Post('set-approval')
  async approveDeclineTrade(
    @GetAccount() profile: { userId: string },
    @Body() data: ApproveDeclineTradeDto,
    @Res() res: Response,
  ) {
    const trade = await this.tradeService.approveDeclineTrade(
      profile.userId,
      data,
    );

    return this.response.okResponse(
      res,
      'trade approved/declined successfully',
      trade,
    );
  }

  @Post(':id/close')
  async closeTrade(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.tradeService.closeTrade(profile.userId, id);

    return this.response.okResponse(res, 'trade closed successfully');
  }

  @Post('message/new')
  async createNewMessage(
    @GetAccount() profile: { userId: string },
    @Body() data: CreateMessageDto,
    @Res() res: Response,
  ) {
    const messages = await this.tradeService.createMessage(
      profile.userId,
      data,
    );

    return this.response.createdResponse(
      res,
      'message created successfully',
      messages,
    );
  }

  @Post('set-trade-rate/:id')
  async setTradeRate(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Body() data: SetTradeRateDto,
    @Res() res: Response,
  ) {
    const trade = await this.tradeService.setTradeRate(
      profile.userId,
      id,
      data,
    );

    return this.response.okResponse(res, 'trade rate set successfully', trade);
  }

  @Get(':id')
  async fetchTrade(@Param('id') id: string, @Res() res: Response) {
    const trade = await this.tradeService.fetchTradeDetails(id);

    return this.response.okResponse(res, 'fetched trade details', trade);
  }

  @Get(':id/export/excel')
  async exportOneTransactions(@Param('id') id: string, @Res() res: Response) {
    return await this.tradeService.exportOneTransactions(res, id);
  }

  @Get('messages/:id')
  async getAllMessages(
    @Param('id') id: string,
    @Query() query: QueryMessageDto,
    @Res() res: Response,
  ) {
    const messages = await this.tradeService.fetchAllTradeMessages(id, query);

    return this.response.okResponse(res, 'fetched trade messages', messages);
  }
}
