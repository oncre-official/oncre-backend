import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RoleRepository } from '@on/app/role/repository/role.repository';
import { SharedService } from '@on/app/shared/shared.service';
import { UserRepository } from '@on/app/user/repository/user.repository';
import { UserStatus } from '@on/enum';
import { generatePassword } from '@on/helpers/password';
import { formatPhoneWithCode, parsePhone } from '@on/helpers/phone';
import { buildUserLookupQuery } from '@on/helpers/user';
import { BaseRepository } from '@on/repository/base.repository';

import { Customer, CustomerDocument } from '../model/customer.model';
import { ICreateCustomer } from '../types/customer.interface';

export class CustomerRepository extends BaseRepository<CustomerDocument> {
  constructor(
    private readonly user: UserRepository,
    private readonly role: RoleRepository,
    private readonly shared: SharedService,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {
    super(customerModel);
  }

  async findOrCreate(payload: ICreateCustomer): Promise<CustomerDocument | null> {
    const { customer_phone, created_by, ...others } = payload;

    const userLookup = buildUserLookupQuery(customer_phone);
    const conditions = [userLookup];

    let customer: CustomerDocument | null = await this.customerModel.findOne({ customer_key: customer_phone });

    const normalizedPhone = formatPhoneWithCode(customer_phone);
    const { code, phone } = parsePhone(normalizedPhone);

    const role = await this.role.findOne({ name: 'customer' }).catch(() => null);

    if (customer) {
      if (!customer.user_id) {
        let user = await this.user.findOne({ $or: conditions });

        if (!user) {
          const [, hashedPassword] = await generatePassword();

          user = await this.user.create({
            country_code: code,
            phone,
            role_id: role?._id,
            password: hashedPassword,
            password_changed: false,
            phone_verified: true,
            email_verified: true,
            status: UserStatus.ACTIVE,
          });
        }

        customer = await this.customerModel.findByIdAndUpdate(customer._id, {
          user_id: user._id,
          ...others,
        });
      }

      if (!customer?.customer_id) {
        const customerId = await this.shared.generateSequentialId('customer_id', 'CUS', 5);

        customer = await this.customerModel.findByIdAndUpdate(customer?._id, {
          customer_id: customerId,
          ...others,
        });
      }

      return customer;
    }

    let user = await this.user.findOne({ $or: conditions });
    if (!user) {
      const [, hashedPassword] = await generatePassword();

      user = await this.user.create({
        country_code: code,
        phone,
        role_id: role?._id,
        password: hashedPassword,
        password_changed: false,
        phone_verified: true,
        email_verified: true,
        status: UserStatus.ACTIVE,
      });
    }

    const customerId = await this.shared.generateSequentialId('customer_id', 'CUS', 5);

    customer = await this.customerModel.create({
      ...payload,
      customer_id: customerId,
      user_id: user._id,
      ...(created_by && { created_by }),
    });

    return customer;
  }
}
