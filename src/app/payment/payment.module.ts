import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';

import { PaymentInstallment, PaymentInstallmentSchema } from './model/payment-installment.model';
import { PaymentPlan, PaymentPlanSchema } from './model/payment-plan.model';
import { Payment, PaymentSchema } from './model/payment.model';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentInstallmentRepository } from './repository/payment-installment.repository';
import { PaymentPlanRepository } from './repository/payment-plan.repository';
import { PaymentRepository } from './repository/payment.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: PaymentPlan.name, schema: PaymentPlanSchema },
      { name: PaymentInstallment.name, schema: PaymentInstallmentSchema },
    ]),
    UserModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentRepository,
    PaymentService,
    PaymentRepository,
    PaymentPlanRepository,
    PaymentInstallmentRepository,
  ],
  exports: [PaymentRepository, PaymentService, PaymentRepository, PaymentPlanRepository, PaymentInstallmentRepository],
})
export class PaymentModule {}
