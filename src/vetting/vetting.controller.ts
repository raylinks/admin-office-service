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
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { Response } from 'express';
import { HttpResponse } from 'src/reponses/http.response';
import { GetAccount } from 'src/decorators/account.decorator';
import { VettingService } from './vetting.service';
import {
  ApproveDeclineWithdrawalDto,
  QueryVettingsDto,
} from './dto/vetting.dto';

@Controller('vetting')
// @ApiSecurity('auth')
// @UseGuards(JwtAuthGuard)
@ApiTags('Vettings')
export class VettingController {
  constructor(
    private readonly vettingService: VettingService,
    private response: HttpResponse,
  ) {}

  @Get('')
  @ApiOkResponse({})
  async getVettings(@Query() query: QueryVettingsDto, @Res() res: Response) {
    const vettings = await this.vettingService.listVetting(query);

    return this.response.okResponse(
      res,
      'fetched all vetting transaction',
      vettings,
    );
  }

  @Get(':id')
  async fetchVetting(@Param('id') id: string, @Res() res: Response) {
    const withdrawal = await this.vettingService.fetchVettingDetails(id);

    return this.response.okResponse(
      res,
      'Vetting records retrieved',
      withdrawal.transaction,
    );
  }

  @Post('set-approval')
  async approveRejectWithdrawal(
    @GetAccount() profile: { userId: string },
    @Body() data: ApproveDeclineWithdrawalDto,
    @Res() res: Response,
  ) {
    const withdrawal = await this.vettingService.approveRejectWithdrawal(
      profile.userId,
      data,
    );

    return this.response.okResponse(
      res,
      'Withdrawal approved/declined successfully',
      withdrawal,
    );
  }

  @Get('/export/excel')
  async exportAllTransactions(
    @Query() query: QueryVettingsDto,
    @Res() res: Response,
  ) {
    return await this.vettingService.exportAllTransactions(res, query);
  }

  @Get(':id/export/excel')
  async exportOneTransactions(@Param('id') id: string, @Res() res: Response) {
    return await this.vettingService.exportOneTransactions(res, id);
  }
}
