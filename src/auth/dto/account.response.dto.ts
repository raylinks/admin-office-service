import { ApiResponseProperty, PartialType } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { OkResponseDto } from 'src/reponses/response.dto';

export class GetAccountResponseDto extends PartialType(OkResponseDto) {
  @ApiResponseProperty({ example: 'Fetched profile successfully' })
  message: string;

  @ApiResponseProperty({
    example: {
      id: '64841907bc681875afbe09ae',
      fullName: 'Michael Enitan',
      email: 'michael@myfurex.co',
      emailVerified: true,
      avatar:
        'https://lh3.googleusercontent.com/a/AAcHTtdPHKVRJaAeZjVUn3PoQ1J1W_MLEpqX1qZAAaaE=s96-c',
      hasFurexAccount: false,
      furexId: null,
      authEnabled: false,
      roleId: '648418fdf828c9664f8d4037',
      createdAt: '2023-06-10T06:32:39.404Z',
      updatedAt: '2023-06-10T06:32:39.404Z',
      role: {
        id: '648418fdf828c9664f8d4037',
        namw: 'OPERATION',
        permissions: [],
        createdAt: '2023-06-10T06:32:27.792Z',
        updatedAt: '2023-06-10T06:32:27.792Z',
      },
    },
  })
  data: User & { role: Role };
}

export class LoginResponseDto extends PartialType(OkResponseDto) {
  @ApiResponseProperty({ example: 'Logged in successfully' })
  message: string;

  @ApiResponseProperty({
    example: {
      user: {
        id: '64841907bc681875afbe09ae',
        fullName: 'Michael Enitan',
        email: 'michael@myfurex.co',
        emailVerified: true,
        avatar:
          'https://lh3.googleusercontent.com/a/AAcHTtdPHKVRJaAeZjVUn3PoQ1J1W_MLEpqX1qZAAaaE=s96-c',
        hasFurexAccount: false,
        furexId: null,
        authEnabled: false,
        roleId: '648418fdf828c9664f8d4037',
        createdAt: '2023-06-10T06:32:39.404Z',
        updatedAt: '2023-06-10T06:32:39.404Z',
      },
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDg0MTkwN2JjNjgxODc1YWZiZTA5YWUiLCJpYXQiOjE2ODYzODI0ODgsImV4cCI6MTY4Njk4NzI4OH0.xTVn78AhjrkxwE36Qh_qM5IrAhEB8kyEnwpkxMyu8zQ',
    },
  })
  data: { user: User; token: string };
}

export class Enable2faResponseDto extends PartialType(OkResponseDto) {
  @ApiResponseProperty({ example: '' })
  message: string;

  @ApiResponseProperty({
    example: {
      secret: 'LF7V673JDBJXSNQ7',
      otpUrl:
        'otpauth://totp/furex:michael%40myfurex.co?secret=LF7V673JDBJXSNQ7&period=30&digits=6&algorithm=SHA1&issuer=furex',
    },
  })
  data: { secret: string; otpUrl: string };
}
