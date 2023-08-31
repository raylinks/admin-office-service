import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum BannerType {
  POPUP = 'POPUP',
  LINK = 'LINK',
  PAGE = 'PAGE',
}

export class BannerPageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  page: string;

  @ApiPropertyOptional({ example: { featured: true } })
  @IsOptional()
  params?: Record<string, unknown>;
}

export class BannerPopupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buttonTitle: string;

  @ApiPropertyOptional({ type: BannerPageDto })
  @IsOptional()
  page?: BannerPageDto;

  @ApiPropertyOptional({ type: BannerPopupDto })
  @IsOptional()
  popup?: BannerPopupDto;
}
