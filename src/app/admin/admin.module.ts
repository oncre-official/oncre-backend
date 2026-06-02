import { Module } from '@nestjs/common';

import { RoleModule } from '../role/role.module';
import { UserModule } from '../user/user.module';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UserModule, RoleModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
