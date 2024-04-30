import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { JwtUserData } from '../interface/active-user-data.interface';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (contextPermissions.length === 0) return true;

    const user: JwtUserData = context.switchToHttp().getRequest()['user'];

    // 上下文中所需要的权限，在user的permissions字段中都要有
    const isHasPermission = contextPermissions.every(
      (requiredPermission) =>
        user.permissions.findIndex((p) => p.code === requiredPermission) > -1,
    );

    if (!isHasPermission) {
      throw new UnauthorizedException('不好意思，您没有访问该接口权限');
    }

    return isHasPermission;
  }
}
