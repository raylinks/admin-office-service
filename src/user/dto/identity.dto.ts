import { ApiProperty } from "@nestjs/swagger";

export const IdentityType = {
  PASSPORT: 'PASSPORT',
  ID_CARD: 'ID_CARD',
  DRIVER_LICENSE: 'DRIVER_LICENSE',
  NIN: 'NIN',
  BVN: "BVN",
  VOTER_CARD: "VOTER_CARD",
  UTILITY: "UTILITY",
  BANK_STATEMENT: "BANK_STATEMENT"

} as const

export class ResetIdetityDto {
  @ApiProperty()
  userId: string

  @ApiProperty()
  idType: typeof IdentityType
}
