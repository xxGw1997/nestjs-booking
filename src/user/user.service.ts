import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { Role } from './entity/role.entity';
import { Permission } from './entity/permission.entity';
import { HashingService } from './hashing/hashing.service';
import { UserInfo } from './vo/user-info.vo';
import { UpdateUserInfoDto } from './dto/update-userinfo.dto';
import { RedisService } from '@/redis/redis.service';
import { EmailService } from '@/email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly hashingService: HashingService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async updateUserInfo(userId: number, updateUserInfoDto: UpdateUserInfoDto) {
    const captcha = await this.redisService.get(
      `update_user_captcha_${updateUserInfoDto.email}`,
    );

    if (!captcha)
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);

    if (updateUserInfoDto.captcha !== captcha)
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);

    const foundUser = await this.findUserDetailById(userId);

    if (updateUserInfoDto.nickName) {
      foundUser.nickName = updateUserInfoDto.nickName;
    }

    if (updateUserInfoDto.headPic) {
      foundUser.headPic = updateUserInfoDto.headPic;
    }

    if (updateUserInfoDto.password) {
      foundUser.password = await this.hashingService.hash(
        updateUserInfoDto.password,
      );
    }

    try {
      await this.userRepository.save(foundUser);
      return 'success';
    } catch (error) {
      return 'failed';
    }
  }

  async updateCaptcha(address: string) {
    const code = Math.random().toString().slice(2, 8);

    try {
      await this.redisService.set(
        `update_user_captcha_${address}`,
        code,
        10 * 60,
      );

      await this.emailService.sendMail({
        to: address,
        subject: '修改用户信息验证',
        html: `<p>你的验证码是: ${code}</p>`,
      });

      return '发送成功';
    } catch (error) {
      throw new HttpException('生成验证码失败', HttpStatus.BAD_REQUEST);
    }
  }

  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = await this.hashingService.hash('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = await this.hashingService.hash('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }
}
