import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsOptional } from "class-validator";

export class QueryLedgerDto {
    @ApiPropertyOptional({ enum: ['CREDIT', 'DEBIT'] })
    @IsEnum(['CREDIT', 'DEBIT'])
    @IsOptional()
    type?: 'CREDIT' | 'DEBIT';

    @ApiPropertyOptional({ enum: ['INIT','PENDING','CONFIRMED','FAILED','CANCELLED'] })
    @IsEnum(['INIT','PENDING','CONFIRMED','FAILED','CANCELLED'])
    @IsOptional()
    status?: 'INIT' | 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

    @ApiPropertyOptional({ default: 40 })
    @IsOptional()
    limit?: number;
  
    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    page?: number;
  
    @ApiPropertyOptional()
    userId?: string;

    @ApiPropertyOptional()
    amount?: number;

    @ApiPropertyOptional()
    from?: Date;

    @ApiPropertyOptional()
    to?: Date;

    @ApiPropertyOptional()
    ledgerId?: string;
  }