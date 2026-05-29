import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';

import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer, CustomerSchema } from './model/customer.model';
import { CustomerRepository } from './repository/customer.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }]), UserModule],
  controllers: [CustomerController],
  providers: [CustomerRepository, CustomerService, CustomerRepository],
  exports: [CustomerRepository, CustomerService, CustomerRepository],
})
export class CustomerModule {}
