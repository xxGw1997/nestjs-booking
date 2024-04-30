import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from '../dto/sign-up.dto';
import { User } from '../entity/user.entity';
import { RedisService } from '@/redis/redis.service';
import { HashingService } from '../hashing/hashing.service';
import { jwtConfig, redisConfig } from '@/config';
import { ConfigType } from '@nestjs/config';
import { EmailService } from '@/email/email.service';
import { SignInDto } from '../dto/sign-in.dto.';
import { SignInUserVo, UserInfo } from '../vo/sign-in-user.vo';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @Inject(RedisService) private readonly redisService: RedisService,
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
    private readonly emailService: EmailService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const captcha = await this.redisService.get(`captcha_${signUpDto.email}`);

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (signUpDto.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = new User();
      user.username = signUpDto.username;
      user.password = await this.hashingService.hash(signUpDto.password);
      user.email = signUpDto.email;
      user.nickName = signUpDto.nickName;

      await this.usersRepository.save(user);

      return '注册成功~';
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException();
      }
      throw error;
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersRepository.findOne({
      where: {
        username: signInDto.username,
        isAdmin: Boolean(signInDto.isAdmin),
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) throw new UnauthorizedException('用户不存在');

    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isEqual) throw new UnauthorizedException('输入的密码不正确');

    const userVo = new SignInUserVo();
    userVo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    const { accessToken, refreshToken } = await this.generateTokens(
      userVo.userInfo,
    );

    userVo.accessToken = accessToken;
    userVo.refreshToken = refreshToken;

    return userVo;
  }

  async refreshToken(refreshToken: string, isAdmin: boolean) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<{
        sub: number;
        refreshTokenId: string;
      }>(refreshToken, {
        secret: this.jwtConfiguration.secret,
      });

      const user = await this.findUserById(sub, isAdmin);

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);

    const userInfo: Partial<UserInfo> = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
    return userInfo;
  }

  async captcha(email: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(
      `captcha_${email}`,
      code,
      +this.redisConfiguration.ttl,
    );

    await this.emailService.sendMail({
      to: email,
      subject: '注册验证码',
      html: `<p>你的注册验证码是${code}</p>`,
    });

    return '发送成功';
  }

  async generateTokens(user: Partial<UserInfo>) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<UserInfo>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    // TODO  把refreshTokenId 存储到redis
    // code ...

    return {
      accessToken,
      refreshToken,
    };
  }

  async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        userId,
        ...payload,
      },
      {
        expiresIn,
        secret: this.jwtConfiguration.secret,
      },
    );
  }
}
