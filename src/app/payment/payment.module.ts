import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PaystackService } from '@on/services/paystack/service';

import { CaseModule } from '../case/case.module';
import { MessageModule } from '../message/message.module';
import { RoleModule } from '../role/role.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

import { PaymentAudit, PaymentAuditSchema } from './model/payment-audit.model';
import { PaymentInstallment, PaymentInstallmentSchema } from './model/payment-installment.model';
import { PaymentPlan, PaymentPlanSchema } from './model/payment-plan.model';
import { Payment, PaymentSchema } from './model/payment.model';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentAuditRepository } from './repository/payment-audit.repository';
import { PaymentInstallmentRepository } from './repository/payment-installment.repository';
import { PaymentPlanRepository } from './repository/payment-plan.repository';
import { PaymentRepository } from './repository/payment.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: PaymentPlan.name, schema: PaymentPlanSchema },
      { name: PaymentAudit.name, schema: PaymentAuditSchema },
      { name: PaymentInstallment.name, schema: PaymentInstallmentSchema },
    ]),
    UserModule,
    RoleModule,
    CaseModule,
    SharedModule,
    MessageModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaystackService,
    PaymentRepository,
    PaymentService,
    PaymentRepository,
    PaymentPlanRepository,
    PaymentAuditRepository,
    PaymentInstallmentRepository,
  ],
  exports: [
    PaymentRepository,
    PaymentService,
    PaymentRepository,
    PaymentPlanRepository,
    PaymentAuditRepository,
    PaymentInstallmentRepository,
  ],
})
export class PaymentModule {}
