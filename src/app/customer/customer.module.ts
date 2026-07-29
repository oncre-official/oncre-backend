import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoleModule } from '../role/role.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer, CustomerSchema } from './model/customer.model';
import { DebtorRestriction, DebtorRestrictionSchema } from './model/debtor-restriction.model';
import { CustomerRepository } from './repository/customer.repository';
import { DebtorRestrictionRepository } from './repository/debtor-restriction.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: DebtorRestriction.name, schema: DebtorRestrictionSchema },
    ]),
    UserModule,
    RoleModule,
    SharedModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerRepository, CustomerService, DebtorRestrictionRepository],
  exports: [CustomerRepository, CustomerService, DebtorRestrictionRepository],
})
export class CustomerModule {}
