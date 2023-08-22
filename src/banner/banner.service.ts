import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_NAMES } from 'src/utils/constants';
import { CreateBannerDto } from './banner.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BannerService {
  constructor(
    @Inject(RMQ_NAMES.USERDATA_SERVICE) private userClient: ClientProxy,
  ) {}

  async createBanner(data: CreateBannerDto) {
    this.userClient.emit('banner.create', data);
  }

  async fetchAllBanners() {
    const banners = await lastValueFrom(
      this.userClient.send('banner.get.all', { service: 'admin-service' }),
    );

    return banners;
  }

  async deleteBanner(id: string) {
    this.userClient.emit('banner.delete', id);
  }
}
