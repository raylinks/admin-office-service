import {
  Body,
  Controller,
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
import { CreateGiftCardDto } from './dto/giftcard.dto';

@Controller('giftcards')
@ApiTags('Giftcard')
@ApiSecurity('auth')
@UseGuards(JwtAuthGuard)
export class GiftcardController {
  constructor(
    private readonly giftcardService: GiftcardService,
    private response: HttpResponse,
  ) { }

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

  @Post('create')
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
}
