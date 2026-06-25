import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BrevoService } from '@on/services/brevo/service';
import { TermiiService } from '@on/services/termii/service';

import { CallModule } from '../call/call.module';
import { CaseModule } from '../case/case.module';
import { MessageModule } from '../message/message.module';
import { PaymentModule } from '../payment/payment.module';
import { RoleModule } from '../role/role.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

import { CallLogController } from './call-log.controller';
import { CallLogService } from './call-log.service';
import { CallLog, CallLogSchema } from './model/call-log.model';
import { CallLogRepository } from './repository/call-log.repository';
import { OutcomeService } from './service/outcome.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CallLog.name, schema: CallLogSchema }]),
    UserModule,
    RoleModule,
    CallModule,
    PaymentModule,
    SharedModule,
    CaseModule,
    MessageModule,
  ],
  controllers: [CallLogController],
  providers: [CallLogService, OutcomeService, TermiiService, CallLogRepository, BrevoService],
  exports: [CallLogService, CallLogRepository],
})
export class CallLogModule {}
