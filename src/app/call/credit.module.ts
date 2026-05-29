import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomerModule } from '../customer/customer.module';
import { NotificationModule } from '../notification/notification.module';

import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';
import { Credit, CreditSchema } from './model/credit.model';
import { Repayment, RepaymentSchema } from './model/repayment.model';
import { CreditRepository } from './repository/credit.repository';
import { RepaymentRepository } from './repository/repayment.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Credit.name, schema: CreditSchema },
      { name: Repayment.name, schema: RepaymentSchema },
    ]),
    CustomerModule,
    NotificationModule,
  ],
  controllers: [CreditController],
  providers: [CreditRepository, CreditService, CreditRepository, RepaymentRepository],
  exports: [CreditRepository, CreditService, CreditRepository, RepaymentRepository],
})
export class CreditModule {}
