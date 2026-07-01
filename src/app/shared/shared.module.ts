import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuditLog, AuditLogSchema } from './model/audit-log.model';
import { Counter, CounterSchema } from './model/counter.model';
import { Lga, LgaSchema } from './model/local-govt.model';
import { State, StateSchema } from './model/state.model';
import { AuditLogRepository } from './repository/audit-log.repository';
import { CounterRepository } from './repository/counter.repository';
import { LgaRepository } from './repository/local-govt.repository';
import { StateRepository } from './repository/state.repository';
import { SharedController } from './shared.controller';
import { SharedService } from './shared.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: State.name, schema: StateSchema },
      { name: Lga.name, schema: LgaSchema },
      { name: Counter.name, schema: CounterSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [SharedController],
  providers: [StateRepository, LgaRepository, CounterRepository, AuditLogRepository, SharedService],
  exports: [StateRepository, LgaRepository, CounterRepository, AuditLogRepository, SharedService],
})
export class SharedModule {}
