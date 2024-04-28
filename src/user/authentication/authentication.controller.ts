import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from '../dto/sign-up.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authenticationService.signUp(signUpDto);
  }

  @Get('captcha')
  async captcha(@Query('address') address: string) {
    return this.authenticationService.captcha(address)
  }

  // @HttpCode(HttpStatus.OK)
  // @Post('sign-in')
  // signIn(@Body() signInDto: SignInDto) {
  //   return this.authenticationService.signIn(signInDto);
  // }
}
