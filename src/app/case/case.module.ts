import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';

import { CaseController } from './case.controller';
import { CaseService } from './case.service';
import { Case, CaseSchema } from './model/case.model';
import { CaseRepository } from './repository/case.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Case.name, schema: CaseSchema }]), UserModule],
  controllers: [CaseController],
  providers: [CaseRepository, CaseService, CaseRepository],
  exports: [CaseRepository, CaseService, CaseRepository],
})
export class CaseModule {}
