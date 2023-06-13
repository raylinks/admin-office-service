import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApproveDeclineTradeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tradeId: string;

  @ApiProperty({ enum: ['approve', 'decline'] })
  @IsEnum(['approve', 'decline'])
  status: 'approve' | 'decline';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comment?: string;
}

export class CreateMessageDto {
  sessionId: string;
  text: string;
  userId: string;
  files: AddFileToMessageDto[];
}

export class AddFileToMessageDto {
  fileMime: string;
  url: string;
}

export class SetTradeRateDto {}

export class QueryTradesDto {
  @ApiPropertyOptional({ enum: ['OPEN', 'CLOSED', 'APPROVED', 'DECLINED'] })
  @IsEnum(['OPEN', 'CLOSED', 'APPROVED', 'DECLINED'])
  @IsOptional()
  status?: 'OPEN' | 'CLOSED' | 'APPROVED' | 'DECLINED';

  @ApiPropertyOptional({ default: 40 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  cardType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  receiptType?: string;
}
