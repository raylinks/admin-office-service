import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class ApproveDeclineWithdrawalDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    transactionId: string;

    @ApiProperty({ enum: ['approve', 'reject'] })
    @IsEnum(['approve', 'reject'])
    status: 'approve' | 'reject';

}

export type QueryVettingsDto = {
    limit?: number;
    page?: number;
    userId?: string;
    from?: Date;
    to?: Date;
    transactionId?: string;
    status?: string;
    amount?: string;
  };
