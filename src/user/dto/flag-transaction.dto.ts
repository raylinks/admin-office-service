import { IsNotEmpty, IsString } from 'class-validator';

/**
 * A DTO representing data to be sent when blacklist users.
 */
export class FlagTransactionDTO {
  @IsString()
  @IsNotEmpty()
  reason: string

}