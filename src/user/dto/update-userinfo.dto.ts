import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @MaxLength(14, { message: '昵称不能超过14个字符' })
  nickName?: string;

  @IsOptional()
  headPic?: string;

  @IsOptional()
  @MinLength(6, { message: '密码不能少于 6 位' })
  password?: string;

  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '不是合法的邮箱格式' })
  email: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
