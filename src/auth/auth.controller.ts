import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { GoogleGuard, IGoogleProfile } from 'src/google/google.guard';
import { HttpResponse } from 'src/reponses/http.response';
import { GetGoogleProfile } from 'src/google/google.decorator';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { GetAccount } from 'src/decorators/account.decorator';
import { Verify2faDto } from './dto/auth.dto';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  Enable2faResponseDto,
  GetAccountResponseDto,
  LoginResponseDto,
} from './dto/account.response.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private response: HttpResponse,
  ) { }

  @Post('login')
  @UseGuards(GoogleGuard)
  @ApiOkResponse({ type: LoginResponseDto })
  async login(
    @GetGoogleProfile() profile: IGoogleProfile,
    @Res() res: Response,
  ) {
    const { user, token } = await this.authService.login(profile);

    return this.response.okResponse(res, 'Logged in successfully', {
      user,
      token,
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('auth')
  @ApiOkResponse({ type: GetAccountResponseDto })
  async getProfile(
    @GetAccount() profile: { userId: string },
    @Res() res: Response,
  ) {
    const user = await this.authService.findById(profile.userId);

    return this.response.okResponse(res, 'Fetched profile successfully', user);
  }

  @Get('2fa')
  @ApiSecurity('auth')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: Enable2faResponseDto })
  async enable2fa(
    @GetAccount() profile: { userId: string },
    @Res() res: Response,
  ) {
    const { secret, otpUrl } = await this.authService.enable2fa(profile.userId);

    return this.response.okResponse(res, '', {
      secret,
      otpUrl,
    });
  }

  @Post('2fa')
  @ApiSecurity('auth')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetAccountResponseDto })
  async complete2fa(
    @GetAccount() profile: { userId: string },
    @Body() data: Verify2faDto,
    @Res() res: Response,
  ) {
    const user = await this.authService.complete2fa(profile.userId, data.token);

    return this.response.okResponse(res, '2fa completed successfully', user);
  }

  @Post('2fa/verify')
  @ApiSecurity('auth')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetAccountResponseDto })
  async verify2fa(
    @GetAccount() profile: { userId: string },
    @Body() data: Verify2faDto,
    @Res() res: Response,
  ) {
    const user = await this.authService.verify2fa(profile.userId, data.token);

    return this.response.okResponse(res, '2fa verified successfully', user);
  }
}
