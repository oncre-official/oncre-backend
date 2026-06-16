import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoleModule } from '../role/role.module';
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
  ],
  controllers: [CallController],
  providers: [CallRepository, CallService, OutcomeService, CallRepository, CallLogRepository],
  exports: [CallRepository, CallService, CallRepository, CallLogRepository],
})
export class CallModule {}
