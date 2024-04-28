import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from '../dto/sign-up.dto';
import { User } from '../entity/user.entity';
import { RedisService } from '@/redis/redis.service';
import { HashingService } from '../hashing/hashing.service';
import { redisConfig } from '@/config';
import { ConfigType } from '@nestjs/config';
import { EmailService } from '@/email/email.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @Inject(RedisService) private readonly redisService: RedisService,
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
    private readonly emailService: EmailService,
    private readonly hashingService: HashingService,
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
}
