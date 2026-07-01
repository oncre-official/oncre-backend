import { ForbiddenException, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { RoleRepository } from '@on/app/role/repository/role.repository';
import { AuditLogRepository } from '@on/app/shared/repository/audit-log.repository';
import { UserDocument } from '@on/app/user/model/user.model';

@Injectable()
export abstract class BaseGuard {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly role: RoleRepository,
    protected readonly auditLog: AuditLogRepository,
  ) {}

  protected async deny(context: ExecutionContext, reason: string): Promise<never> {
    const request = context.switchToHttp().getRequest();
    const user = (request.user as UserDocument) || { _id: 'unknown' };

    const forwardedFor = request.headers['x-forwarded-for'] || request.headers['x-real-ip'];
    const ip = forwardedFor ? (forwardedFor as string).split(',')[0] : request.ip;

    await this.auditLog.create({
      user_id: user?._id,
      action: 'ACCESS_DENIED',
      route: request.originalUrl || request.url,
      method: request.method,
      reason,
      ip_address: ip || request.connection.remoteAddress,
      user_agent: request.headers['user-agent'],
      created_at: new Date(),
    });

    throw new ForbiddenException('You do not have permission to access this resource.');
  }
}
