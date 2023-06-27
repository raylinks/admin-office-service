
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

/**
 * A DTO representing data to be sent when getting users.
 */
export class GetUsersDTO {
  @IsOptional()
  sortBy: string

  @Transform(({ value }) => parseInt(value))
  pageNo?: string;

  @Transform(({ value }) => parseInt(value))
  pageLen?: string;
}