import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Permission } from '@on/app/role/model/permission.model';
import { UserDocument } from '@on/app/user/model/user.model';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user: UserDocument = request.user;

    const userPermissions: string[] = user.role?.permissions?.map((permission: Permission) => permission.name) ?? [];

    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }
}
