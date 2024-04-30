import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { Permissions } from './decorators/permission.decorator';
import { User } from './decorators/user.decorator';
import { UpdateUserInfoDto } from './dto/update-userinfo.dto';
import { UserInfo } from './vo/user-info.vo';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('userInfo')
  async userInfo(@User('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);

    const userInfoVo = new UserInfo();
    userInfoVo.id = user.id;
    userInfoVo.email = user.email;
    userInfoVo.username = user.username;
    userInfoVo.headPic = user.headPic;
    userInfoVo.phoneNumber = user.phoneNumber;
    userInfoVo.nickName = user.nickName;
    userInfoVo.createTime = user.createTime.getTime();
    userInfoVo.isFrozen = user.isFrozen;

    return userInfoVo;
  }

  @Post('updateUserInfo')
  async updatePwd(
    @User('userId') userId: number,
    @Body() updateUserInfo: UpdateUserInfoDto,
  ) {
    return this.userService.updateUserInfo(userId, updateUserInfo);
  }

  @Get('update/captcha')
  async updateCaptcha(@Query('address') address: string) {
    return this.userService.updateCaptcha(address);
  }

  /**   测试方法      */
  @Get('initUser')
  initUser() {
    this.userService.initData();
  }

  @Get('test')
  test() {
    return 'success';
  }

  @Get('aaa')
  @Permissions('aaa')
  aaa() {
    return 'aaa';
  }
}
