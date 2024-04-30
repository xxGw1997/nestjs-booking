import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from '../dto/sign-up.dto';
import { SignInDto } from '../dto/sign-in.dto.';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Auth, AuthType } from '../decorators/auth.decorator';

@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authenticationService.signUp(signUpDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authenticationService.signIn(signInDto);
  }

  @Post('refresh-token')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshToken(
      refreshTokenDto.refreshToken,
      Boolean(refreshTokenDto.isAdmin),
    );
  }

  @Get('captcha')
  async captcha(@Query('address') address: string) {
    return this.authenticationService.captcha(address);
  }

  // @HttpCode(HttpStatus.OK)
  // @Post('sign-in')
  // signIn(@Body() signInDto: SignInDto) {
  //   return this.authenticationService.signIn(signInDto);
  // }
}
