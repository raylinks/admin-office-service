import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './banner.dto';
import { Response } from 'express';
import { HttpResponse } from 'src/reponses/http.response';

@Controller('banner')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
    private response: HttpResponse,
  ) {}

  @Post('create')
  async createBanner(@Body() data: CreateBannerDto, @Res() res: Response) {
    await this.bannerService.createBanner(data);

    return this.response.createdResponse(res, 'banner created successfully');
  }

  @Get()
  async getAllBanners(@Res() res: Response) {
    const banners = await this.bannerService.fetchAllBanners();

    return this.response.okResponse(
      res,
      'banners fetched successfully',
      banners,
    );
  }

  @Delete(':id')
  async deleteBanner(@Param('id') id: string, @Res() res: Response) {
    await this.bannerService.deleteBanner(id);

    return this.response.okResponse(res, 'banner deleted successfully');
  }
}
