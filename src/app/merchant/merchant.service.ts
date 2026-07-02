import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { UserStatus } from '@on/enum';
import { formatPhoneWithCode, parsePhone } from '@on/helpers/phone';
import { joinSearchQuery } from '@on/helpers/search';
import { buildUserLookupQuery } from '@on/helpers/user';
import { QueryDto } from '@on/utils/dto/query.dto';
import { ServiceResponse } from '@on/utils/types';

import { RoleRepository } from '../role/repository/role.repository';
import { SharedService } from '../shared/shared.service';
import { User } from '../user/model/user.model';
import { UserRepository } from '../user/repository/user.repository';

import { CreateMerchantDto } from './dto/merchant.dto';
import { Merchant } from './model/merchant.model';
import { MerchantRepository } from './repository/merchant.repository';

@Injectable()
export class MerchantService {
  constructor(
    private readonly user: UserRepository,
    private readonly role: RoleRepository,
    private readonly shared: SharedService,
    private readonly merchant: MerchantRepository,
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
      search: () => this.merchant.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.merchant.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'user' }],
          sort: { created_at: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'Merchants successfully fetched' };
  }

  async create(creator: User, payload: CreateMerchantDto): Promise<ServiceResponse<Merchant | any>> {
    const { merchant_name, merchant_phone } = payload;

    const normalizedPhone = formatPhoneWithCode(merchant_phone);
    const { code, phone } = parsePhone(normalizedPhone);

    const role = await this.role.findOne({ name: 'merchant' });
    if (!role) throw new NotFoundException('Merchant role not found');

    const creatorRole = await this.role.findById(creator.role_id);
    if (!creatorRole) throw new NotFoundException('Creator role not found');

    const merchantExist = await this.merchant.findOne({ $or: [{ merchant_name }, { merchant_phone }] });
    if (merchantExist) throw new ConflictException('Merchant already exists');

    const userLookup = buildUserLookupQuery(merchant_phone);
    const conditions = [userLookup];

    let user = await this.user.findOne({ $or: conditions });
    if (!user) {
      user = await this.user.create({
        country_code: code,
        phone: phone,
        role_id: role.id,
        password_changed: false,
        phone_verified: true,
        email_verified: true,
        status: UserStatus.INACTIVE,
      });
    }

    const merchantId = await this.shared.generateSequentialId('merchant_id', 'MER', 5);

    const merchantPayload = {
      ...payload,
      merchant_id: merchantId,
      user_id: user._id,
      created_by: creator._id,
      channel: creatorRole.name,
    };

    const merchant = await this.merchant.create(merchantPayload);

    const data = { ...merchant.toObject() };

    return { data, message: `Merchant successfully created` };
  }
}
