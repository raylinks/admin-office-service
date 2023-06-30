import {
  ApiPropertyOptional
} from '@nestjs/swagger';

export class UpdateAccountInformationDTO  {

  @ApiPropertyOptional({ type: String })
  status?: string;

  @ApiPropertyOptional({ type: String })
  firstName?: string;

  @ApiPropertyOptional({ type: String })
  lastName?: string;
}