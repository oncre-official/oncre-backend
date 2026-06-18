import { Module } from '@nestjs/common';

import { PaymentModule } from '../payment/payment.module';

import { CaseModule } from './../case/case.module';
import { MessageModule } from './../message/message.module';
import { PaymentPlanSerice } from './services/payment-plan.service';

@Module({
  imports: [CaseModule, MessageModule, PaymentModule],
  providers: [PaymentPlanSerice],
})
export class CronsModule {}
