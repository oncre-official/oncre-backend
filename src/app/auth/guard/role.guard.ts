import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RoleRepository } from '@on/app/role/repository/role.repository';
import { UserDocument } from '@on/app/user/model/user.model';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly role: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest();

    const user: UserDocument = request.user;
    const role = await this.role.findById(user.role_id);

    return requiredRoles.includes(role.name);
  }
}
