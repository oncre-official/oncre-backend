import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { CloudinaryService } from '@on/services/cloudinary/service';

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
    NestjsFormDataModule,
  ],
  controllers: [SharedController],
  providers: [StateRepository, LgaRepository, CounterRepository, AuditLogRepository, SharedService, CloudinaryService],
  exports: [StateRepository, LgaRepository, CounterRepository, AuditLogRepository, SharedService],
})
export class SharedModule {}
