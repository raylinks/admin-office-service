import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
  PartialType,
} from '@nestjs/swagger';
import { OkResponseDto } from 'src/reponses/response.dto';
import { CURRENCY } from 'src/utils/constants';

export class FetchWalletBalanceResponseDto extends PartialType(OkResponseDto) {
  @ApiResponseProperty({ example: 'Balance Fetched Successfully' })
  message: string;

  @ApiResponseProperty({
    example: {
      balance: {
        fiat: [
          {
            symbol: 'NGN',
            balance: 369.74,
            value: 0.47,
          },
        ],
        crypto: [
          {
            symbol: 'USDT',
            balance: 0,
            value: 0,
          },
          {
            symbol: 'BTC',
            balance: 0.0000213,
            value: 0.73,
          },
        ],
      },
      totalBalance: 1.2,
      totalDepositedAmount: 1.27,
      totalWithdrawnAmount: 0,
    },
  })
  data: Record<string, unknown>;
}

export class FetchCustomerTransactionsResponseDto extends PartialType(
  OkResponseDto,
) {
  @ApiResponseProperty({ example: 'Fetched Transactions Successfully' })
  message: string;

  @ApiResponseProperty({
    example: {
      NGN: [
        {
          symbol: 'NGN',
          eventType: 'FiatDepositEvent',
          amount: 79159.4,
          createdAt: '2023-09-28T08:27:11.552Z',
          type: 'CREDIT',
        },
        {
          symbol: 'NGN',
          eventType: 'FiatWithdrawalEvent',
          amount: 7558.18,
          createdAt: '2023-08-27T15:45:59.679Z',
          type: 'DEBIT',
        },
        {
          symbol: 'NGN',
          eventType: 'SellEvent',
          amount: 15780.69,
          createdAt: '2023-10-19T22:31:18.864Z',
          type: 'CREDIT',
        },
        {
          symbol: 'NGN',
          eventType: 'BuyEvent',
          amount: 51069.47,
          createdAt: '2023-10-26T14:01:07.638Z',
          type: 'DEBIT',
        },
      ],
      TRX: [
        {
          symbol: 'TRX',
          eventType: 'BuyEvent',
          amount: 199.57183736,
          createdAt: '2023-09-13T16:00:01.499Z',
          type: 'CREDIT',
        },
        {
          symbol: 'TRX',
          eventType: 'SellEvent',
          amount: 750.4738642,
          createdAt: '2023-09-09T08:42:47.471Z',
          type: 'DEBIT',
        },
      ],
      BCH: [
        {
          symbol: 'BCH',
          eventType: 'BuyEvent',
          amount: 0.15,
          createdAt: '2023-09-09T03:07:03.221Z',
          type: 'CREDIT',
        },
      ],
      USDT: [
        {
          symbol: 'USDT',
          eventType: 'BuyEvent',
          amount: 6.4664384,
          createdAt: '2023-10-26T14:01:07.638Z',
          type: 'CREDIT',
        },
        {
          symbol: 'USDT',
          eventType: 'SellEvent',
          amount: 1,
          createdAt: '2023-10-15T11:08:35.617Z',
          type: 'DEBIT',
        },
        {
          symbol: 'USDT',
          eventType: 'SwapEvent',
          amount: 5,
          createdAt: '2023-10-15T11:18:49.578Z',
          type: 'DEBIT',
        },
      ],
      ETH: [
        {
          symbol: 'ETH',
          eventType: 'SwapEvent',
          amount: 0.00320888,
          createdAt: '2023-10-15T11:18:49.578Z',
          type: 'CREDIT',
        },
      ],
      BTC: [
        {
          symbol: 'BTC',
          eventType: 'BuyEvent',
          amount: 0.00000622,
          createdAt: '2023-10-25T08:00:13.244Z',
          type: 'CREDIT',
        },
        {
          symbol: 'BTC',
          eventType: 'SellEvent',
          amount: 5e-8,
          createdAt: '2023-10-19T22:31:18.864Z',
          type: 'DEBIT',
        },
      ],
    },
  })
  data: Record<string, unknown>;
}

export class QueryCustomerTransactionDto {
  @ApiPropertyOptional({ enum: ['USD', 'NGN'] })
  currency?: CURRENCY;
  @ApiPropertyOptional({ default: 50 })
  limit?: number;
  @ApiPropertyOptional({ default: 0 })
  page?: number;
}

// cld9ano540008o90qe4hamci3
