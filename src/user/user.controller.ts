import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('initUser')
  initUser() {
    this.userService.initData();
  }

  @Get('test')
  test() {
    return 'success';
  }
}
