import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TermiiService } from '@on/services/termii/service';

import { CustomerModule } from '../customer/customer.module';
import { MerchantModule } from '../merchant/merchant.module';
import { MessageModule } from '../message/message.module';
import { RoleModule } from '../role/role.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

import { CaseController } from './case.controller';
import { CaseService } from './case.service';
import { Case, CaseSchema } from './model/case.model';
import { CaseRepository } from './repository/case.repository';
import { MessageService } from './services/message.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Case.name, schema: CaseSchema }]),
    UserModule,
    RoleModule,
    SharedModule,
    MessageModule,
    MerchantModule,
    CustomerModule,
  ],
  controllers: [CaseController],
  providers: [CaseRepository, CaseService, CaseRepository, MessageService, TermiiService],
  exports: [CaseRepository, CaseService, CaseRepository],
})
export class CaseModule {}
