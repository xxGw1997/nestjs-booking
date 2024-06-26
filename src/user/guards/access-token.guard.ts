import { jwtConfig } from '@/config';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtUserData } from '../interface/active-user-data.interface';
import { UnAuthException } from '@/filters/un-auth.filter';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeaders(req);
    if (!token) throw new UnAuthException();

    try {
      const payload = await this.jwtService.verifyAsync<JwtUserData>(token, {
        secret: this.jwtConfiguration.secret,
      });

      req['user'] = {
        userId: payload.userId,
        username: payload.username,
        roles: payload.roles,
        permissions: payload.permissions,
      };
    } catch (error) {
      throw new UnAuthException();
    }

    return true;
  }

  getTokenFromHeaders(request: Request): string {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
