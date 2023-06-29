import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GiftcardService } from './giftcard.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { HttpResponse } from 'src/reponses/http.response';
import { Response } from 'express';
import { ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetAccount } from 'src/decorators/account.decorator';
import { CreateGiftCardDto, SetCardRateDto } from './dto/giftcard.dto';

@Controller('giftcards')
@ApiTags('Giftcard')
@ApiSecurity('auth')
@UseGuards(JwtAuthGuard)
export class GiftcardController {
  constructor(
    private readonly giftcardService: GiftcardService,
    private response: HttpResponse,
  ) {}

  @Get('')
  async fetchAllCards(@Res() res: Response) {
    const cards = await this.giftcardService.fetchAllCards();

    return this.response.okResponse(res, 'fetched all giftcards', cards);
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  async fetchGiftcardDetails(@Param('id') id: string, @Res() res: Response) {
    const card = await this.giftcardService.fetchCard(id);

    return this.response.okResponse(res, 'fetched giftcard details', card);
  }

  @Post('new')
  async createCard(
    @GetAccount() profile: { userId: string },
    @Body() data: CreateGiftCardDto,
    @Res() res: Response,
  ) {
    await this.giftcardService.createCard(profile.userId, data);

    return this.response.createdResponse(
      res,
      'giftcard created successfully',
      null,
    );
  }

  @Post('disable/:id')
  async disableCard(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.disableCard(profile.userId, id);

    return this.response.okResponse(
      res,
      'giftcard disabled successfully',
      null,
    );
  }

  @Post('enable/:id')
  async enableCard(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.enableCard(profile.userId, id);

    return this.response.okResponse(res, 'giftcard enabled successfully', null);
  }

  @Post('set-rate')
  async setDenominationRate(
    @GetAccount() profile: { userId: string },
    @Body() data: SetCardRateDto,
    @Res() res: Response,
  ) {
    const card = await this.giftcardService.setCardRate(profile.userId, data);

    return this.response.okResponse(
      res,
      'denomination rate set successfully',
      card,
    );
  }

  @Delete('delete/currency/:id')
  async deleteCardCurrency(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.deleteCardCurrency(profile.userId, id);

    return this.response.okResponse(res, 'card currency deleted successfully');
  }

  @Delete('delete/denomination/:id')
  async deleteCardDenomination(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.deleteCardDenomination(profile.userId, id);

    return this.response.okResponse(res, 'denomination deleted successfully');
  }

  @Delete('delete/number/:id')
  async deleteCardNumber(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.deleteCardNumber(profile.userId, id);

    return this.response.okResponse(res, 'card number deleted successfully');
  }

  @Delete('delete/receipt/:id')
  async deleteCardReceipt(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.deleteCardReceipt(profile.userId, id);

    return this.response.okResponse(res, 'card receipt deleted successfully');
  }
}
