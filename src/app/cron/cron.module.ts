import { Module } from '@nestjs/common';

import { TermiiService } from '@on/services/termii/service';

import { PaymentModule } from '../payment/payment.module';

import { CaseModule } from './../case/case.module';
import { MessageModule } from './../message/message.module';
import { PaymentPlanSerice } from './services/payment-plan.service';
import { ScheduledMessageSerice } from './services/scheduled-message.service';

@Module({
  imports: [CaseModule, MessageModule, PaymentModule],
  providers: [PaymentPlanSerice, TermiiService, ScheduledMessageSerice],
})
export class CronModule {}
