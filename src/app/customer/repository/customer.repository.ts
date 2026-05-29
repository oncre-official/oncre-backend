import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Customer, CustomerDocument } from '../model/customer.model';

export class CustomerRepository extends BaseRepository<CustomerDocument> {
  constructor(@InjectModel(Customer.name) private customerModel: Model<CustomerDocument>) {
    super(customerModel);
  }
}
