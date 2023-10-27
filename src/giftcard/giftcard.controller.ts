import {
  BadRequestException,
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
import { CreateCardBuyRangeDto } from './dto/create-card-buy-range.dto';

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
    await this.checkIfUserHasPermission(profile.userId);

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

  /////////    GIFTCARD BUY BEGINS HERE

  @Get('card/buy')
  async fetchAllCardBuys(@Res() res: Response) {
    const cards = await this.giftcardService.fetchAllCardBuys();

    return this.response.okResponse(res, 'fetched all giftcards buy', cards);
  }

  @Get('card/buy/:id')
  @ApiParam({ name: 'id' })
  async fetchCardBuyDetails(@Param('id') id: string, @Res() res: Response) {
    const card = await this.giftcardService.fetchCardBuy(id);

    return this.response.okResponse(res, 'fetched giftcard details', card);
  }

  @Post('card/buy/new')
  async createCardBuy(
    @GetAccount() profile: { userId: string },
    @Body() data: CreateGiftCardDto,
    @Res() res: Response,
  ) {
    await this.checkIfUserHasPermission(profile.userId);

    await this.giftcardService.createCardBuy(profile.userId, data);

    return this.response.createdResponse(
      res,
      'giftcard buy created successfully',
      null,
    );
  }

  @Post('card/buy/range')
  async createCardBuyRange(
    @GetAccount() profile: { userId: string },
    @Body() payload: CreateCardBuyRangeDto,
    @Res() res: Response,
  ) {
    await this.checkIfUserHasPermission(profile.userId);

    await this.giftcardService.createCardBuyRange("23456234", payload);

    return this.response.createdResponse(
      res,
      'giftcard buy range created successfully',
      null,
    );
  }

  @Post('card/buy/disable/:id')
  async disableCardBuy(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.disableCardBuy(profile.userId, id);

    return this.response.okResponse(
      res,
      'giftcard buy disabled successfully',
      null,
    );
  }

  @Post('card/buy/enable/:id')
  async enableCardBuy(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.enableCardBuy(profile.userId, id);

    return this.response.okResponse(
      res,
      'giftcard buy enabled successfully',
      null,
    );
  }

  @Post('card/buy/set-rate')
  async setDenominationRateForCardBuy(
    @GetAccount() profile: { userId: string },
    @Body() data: SetCardRateDto,
    @Res() res: Response,
  ) {
    const card = await this.giftcardService.setCardBuyRate(
      profile.userId,
      data,
    );

    return this.response.okResponse(
      res,
      'card buy denomination rate set successfully',
      card,
    );
  }

  @Delete('card/buy/delete/currency/:id')
  async deleteCardBuyCurrency(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.deleteCardBuyCurrency(profile.userId, id);

    return this.response.okResponse(
      res,
      'card buy currency deleted successfully',
    );
  }

  @Delete('card/buy/delete/denomination/:id')
  async deleteCardBuyDenomination(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.deleteCardBuyDenomination(profile.userId, id);

    return this.response.okResponse(
      res,
      'card buy denomination deleted successfully',
    );
  }

  @Delete('card/buy/delete/number/:id')
  async deleteCardBuyNumber(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.deleteCardBuyNumber(profile.userId, id);

    return this.response.okResponse(
      res,
      'card buy number deleted successfully',
    );
  }

  @Delete('card/buy/delete/receipt/:id')
  async deleteCarBuydReceipt(
    @GetAccount() profile: { userId: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.giftcardService.deleteCardBuyReceipt(profile.userId, id);

    return this.response.okResponse(
      res,
      'card buy receipt deleted successfully',
    );
  }

  private async checkIfUserHasPermission(userId: string) {
    const user = await this.giftcardService.fetchUserById(userId);

    const allowedEmails = ['phenomenal@myfurex.co'];
    if (!allowedEmails.includes(user.email)) {
      throw new BadRequestException(
        'You do not have permission to perform this action',
      );
    }
  }
}
