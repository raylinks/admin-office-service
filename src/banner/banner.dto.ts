import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum BannerType {
  POPUP = 'POPUP',
  LINK = 'LINK',
  PAGE = 'PAGE',
}

export class BannerPageDto {
  page: string;
  params?: Record<string, unknown>;
}

export class BannerPopupDto {
  title: string;
  description: string;
  image: string;
  link?: string;
  buttonTitle: string;
}

export class CreateBannerDto {
  @ApiProperty({ enum: BannerType })
  @IsNotEmpty()
  @IsEnum(BannerType)
  type: BannerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ type: BannerPageDto })
  @IsOptional()
  page?: BannerPageDto;

  @ApiPropertyOptional({ type: BannerPopupDto })
  @IsOptional()
  popup?: BannerPopupDto;
}
