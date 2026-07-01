import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RoleRepository } from '@on/app/role/repository/role.repository';
import { AuditLogRepository } from '@on/app/shared/repository/audit-log.repository';
import { UserDocument } from '@on/app/user/model/user.model';

import { BaseGuard } from './base.guard';

@Injectable()
export class RoleGuard extends BaseGuard implements CanActivate {
  constructor(reflector: Reflector, role: RoleRepository, auditLog: AuditLogRepository) {
    super(reflector, role, auditLog);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user: UserDocument = request.user;

    const role = await this.role.findById(user.role_id);

    if (!role || !requiredRoles.includes(role.name)) {
      await this.deny(context, 'Missing required role');
    }

    return true;
  }
}
