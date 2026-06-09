import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { UserStatus } from '@on/enum';
import { generatePassword } from '@on/helpers/password';
import { formatPhoneWithCode, parsePhone } from '@on/helpers/phone';
import { joinSearchQuery } from '@on/helpers/search';
import { buildUserLookupQuery } from '@on/helpers/user';
import { QueryDto } from '@on/utils/dto/query.dto';
import { ServiceResponse } from '@on/utils/types';

import { RoleRepository } from '../role/repository/role.repository';
import { SharedService } from '../shared/shared.service';
import { User } from '../user/model/user.model';
import { UserRepository } from '../user/repository/user.repository';

import { CreateCustomerDto } from './dto/customer.dto';
import { Customer } from './model/customer.model';
import { CustomerRepository } from './repository/customer.repository';

@Injectable()
export class CustomerService {
  constructor(
    private readonly user: UserRepository,
    private readonly role: RoleRepository,
    private readonly shared: SharedService,
    private readonly customer: CustomerRepository,
  ) {}

  async find(query: QueryDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [
        {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
          searchFields: ['email', 'phone'],
        },
      ],
    });

    const strategies = {
      search: () => this.customer.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.customer.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'user' }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'Customers successfully fetched' };
  }

  async create(creator: User, payload: CreateCustomerDto): Promise<ServiceResponse<Customer | any>> {
    const { customer_phone } = payload;

    const normalizedPhone = formatPhoneWithCode(customer_phone);
    const { code, phone } = parsePhone(normalizedPhone);

    const role = await this.role.findOne({ name: 'customer' });
    if (!role) throw new NotFoundException('Customer role not found');

    const customerExist = await this.customer.findOne({ customer_key: customer_phone });
    if (customerExist) throw new ConflictException('Customer already exists');

    const userLookup = buildUserLookupQuery(customer_phone);
    const conditions = [userLookup];

    const [password, hashedPassword] = await generatePassword();

    let user = await this.user.findOne({ $or: conditions });
    if (!user) {
      user = await this.user.create({
        country_code: code,
        phone: phone,
        role_id: role.id,
        password: hashedPassword,
        password_changed: false,
        phone_verified: true,
        email_verified: true,
        status: UserStatus.ACTIVE,
      });
    }

    const customerId = await this.shared.generateSequentialId('customer_id', 'CUS', 5);

    const customerPayload = {
      ...payload,
      customer_id: customerId,
      customer_key: customer_phone,
      user_id: user._id,
      created_by: creator._id,
    };

    const customer = await this.customer.create(customerPayload);

    const data = { ...customer.toObject(), password };

    return { data, message: `Customer successfully created` };
  }
}
