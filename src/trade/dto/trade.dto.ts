import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
  PartialType,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUppercase,
} from 'class-validator';
import { OkResponseDto } from 'src/reponses/response.dto';

export class AddFileToMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileMime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}

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
  @ApiProperty()
  @IsNotEmpty()
  sessionId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ type: AddFileToMessageDto })
  @IsOptional()
  files?: AddFileToMessageDto[];
}

export class SetTradeRateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  rate: number;
}

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
  userId?: string;
  @ApiPropertyOptional()
  from?: Date;
  @ApiPropertyOptional()
  to?: Date;
  @ApiPropertyOptional()
  tradeId?: string;
}

export class QueryMessageDto {
  @ApiPropertyOptional({ default: 40 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  page?: number;
}

export class FetchAllTradesResponseDto extends PartialType(OkResponseDto) {
  @ApiResponseProperty({ example: 'fetched all trades' })
  message: string;

  @ApiResponseProperty({
    example: {
      trades: [
        {
          id: '5d5e6001-a7d5-4098-bce0-e83b05e42a8a',
          userId: 'cldctrn1h0000od0qsf2jnudh',
          status: 'OPEN',
          denomination: 30,
          quantity: 1,
          currency: 'GBP',
          cardType: 'Amazon',
          cardImg:
            'https://furex.fra1.digitaloceanspaces.com/assets/web/3e7d6ab9-6dc7-4a01-9bce-6d8a6a13c19e-amazon.png',
          cardNumber: '3779',
          receiptType: 'No Receipt',
          rate: null,
          sessionId: '32d4013a-e937-4d95-b15e-188683b10b00',
          createdAt: '2023-06-14T19:07:04.349Z',
          country: 'AU',
          approvedBy: null,
          declinedBy: null,
          comment: null,
        },
        {
          id: '4476f68c-3d5e-481a-acee-b3e51285cfdc',
          userId: 'cldctrn1h0000od0qsf2jnudh',
          status: 'OPEN',
          denomination: 30,
          quantity: 1,
          currency: 'GBP',
          cardType: 'Amazon',
          cardImg:
            'https://furex.fra1.digitaloceanspaces.com/assets/web/3e7d6ab9-6dc7-4a01-9bce-6d8a6a13c19e-amazon.png',
          cardNumber: '3779',
          receiptType: 'No Receipt',
          rate: null,
          sessionId: 'e9cc3600-a369-4c2f-ac3c-60cac56d9762',
          createdAt: '2023-06-14T19:05:31.067Z',
          country: 'AU',
          approvedBy: null,
          declinedBy: null,
          comment: null,
        },
      ],
      totalTrades: 73,
      openTrades: 3,
      closedTrades: 40,
      approvedTrades: 16,
      declinedTrades: 14,
      meta: {
        size: 2,
        totalItems: 73,
        nextPage: 1,
        previousPage: 0,
      },
    },
  })
  data: any;
}

export type TransactionTypeActionDto = {
  symbol: string;
  amount: number;
  userId: string;
  accountId?: string;
  note?: string;
};

export type ExternalTransactionActionDto = {
  thirdPartyTxId: string;
  txType: string;
  status: string;
  data: TransactionTypeActionDto;
  thirdPartyDetails?: any;
};
