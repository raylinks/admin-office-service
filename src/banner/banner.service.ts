import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { QUEUE_NAMES, RMQ_NAMES } from 'src/utils/constants';
import { CreateBannerDto } from './banner.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BannerService {
  constructor(
    @Inject(RMQ_NAMES.USERDATA_SERVICE) private userClient: ClientRMQ,
  ) {}

  async createBanner(data: CreateBannerDto) {
    this.userClient.emit('banner.create', data);
  }

  async fetchAllBanners() {
    const banners = await lastValueFrom(
      this.userClient.send('banner.get.all', {}),
    );

    return banners;
  }

  async deleteBanner(id: string) {
    this.userClient.emit('banner.delete', id);
  }
}
