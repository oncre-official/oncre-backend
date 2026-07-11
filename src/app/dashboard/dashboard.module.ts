import { Module } from '@nestjs/common';

import { CallModule } from '../call/call.module';
import { CaseModule } from '../case/case.module';
import { PaymentModule } from '../payment/payment.module';
import { RoleModule } from '../role/role.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [UserModule, RoleModule, SharedModule, CaseModule, PaymentModule, CallModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
