import { ApiResponseProperty, PartialType } from '@nestjs/swagger';
import { OkResponseDto } from 'src/reponses/response.dto';

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
