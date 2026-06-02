import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Permission } from '@on/app/role/model/permission.model';
import { RoleRepository } from '@on/app/role/repository/role.repository';
import { UserDocument } from '@on/app/user/model/user.model';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly role: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user: UserDocument = request.user;

    const role = await this.role.findById(user.role_id, { populate: [{ path: 'permissions' }] });
    const userPermissions: string[] = role?.permissions?.map((permission: Permission) => permission.name) ?? [];

    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }
}
