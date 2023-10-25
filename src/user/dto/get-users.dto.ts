import {  ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

/**
 * A DTO representing data to be sent when getting users.
 */
export class GetUsersDTO {
  @ApiPropertyOptional({ default: 40 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'user partial lastName',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @Matches(/^[a-zA-Z ]*$/, { message: 'lastName must be alphabets' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'furex id',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @Matches(/^[a-zA-Z ]*$/, { message: 'lastName must be alphabets' })
  furexId: string;

  @ApiPropertyOptional({
    description: 'customer partial phoneNumber',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @Matches(/^[a-zA-Z ]*$/, { message: 'phoneNumber must be number' })
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'customer partial phoneNumber',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @Matches(/^[a-zA-Z ]*$/, { message: 'phoneNumber must be number' })
  email: string;

  @ApiPropertyOptional({ description: 'user account number', required: false })
  @IsString()
  @IsOptional()
  status: string;

  @ApiPropertyOptional({ description: 'user account number', required: false })
  @IsString()
  @IsOptional()
  date: string;

  @ApiPropertyOptional({ default: 'oldest and newest', required: false })
  @IsOptional()
  sortBy: string;
}
