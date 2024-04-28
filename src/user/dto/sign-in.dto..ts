import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @MaxLength(14, { message: '用户名不能超过14个字符' })
  username: string;

  @IsNotEmpty({ message: '昵称不能为空' })
  @MaxLength(14, { message: '昵称不能超过14个字符' })
  nickName: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码不能少于 6 位' })
  password: string;

  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail({}, { message: '请输入正确的邮箱格式' })
  email: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
