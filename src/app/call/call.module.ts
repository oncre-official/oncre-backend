import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TermiiService } from '@on/services/termii/service';

import { MessageModule } from '../message/message.module';
import { RoleModule } from '../role/role.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

import { CallController } from './call.controller';
import { CallService } from './call.service';
import { CallLog, CallLogSchema } from './model/call-log.model';
import { Call, CallSchema } from './model/call.model';
import { CallLogRepository } from './repository/call-log.repository';
import { CallRepository } from './repository/call.repository';
import { OutcomeService } from './service/outcome.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Call.name, schema: CallSchema },
      { name: CallLog.name, schema: CallLogSchema },
    ]),
    UserModule,
    RoleModule,
    SharedModule,
    MessageModule,
  ],
  controllers: [CallController],
  providers: [CallRepository, CallService, OutcomeService, TermiiService, CallRepository, CallLogRepository],
  exports: [CallRepository, CallService, CallRepository, CallLogRepository],
})
export class CallModule {}
