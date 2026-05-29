import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';

import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';
import { Credit, CreditSchema } from './model/credit.model';
import { CreditRepository } from './repository/credit.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Credit.name, schema: CreditSchema }]), UserModule],
  controllers: [CreditController],
  providers: [CreditRepository, CreditService, CreditRepository],
  exports: [CreditRepository, CreditService, CreditRepository],
})
export class CreditModule {}
