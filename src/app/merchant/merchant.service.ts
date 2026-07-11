import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PaymentStatus, UserStatus } from '@on/enum';
import { formatPhoneWithCode, parsePhone } from '@on/helpers/phone';
import { joinSearchQuery } from '@on/helpers/search';
import { buildUserLookupQuery } from '@on/helpers/user';
import { QueryDto } from '@on/utils/dto/query.dto';
import { ServiceResponse } from '@on/utils/types';

import { PaymentRepository } from '../payment/repository/payment.repository';
import { PaymentType } from '../payment/types/payment.interface';
import { RoleRepository } from '../role/repository/role.repository';
import { SharedService } from '../shared/shared.service';
import { User } from '../user/model/user.model';
import { UserRepository } from '../user/repository/user.repository';

import { CreateMerchantDto } from './dto/merchant.dto';
import { Merchant } from './model/merchant.model';
import { MerchantRepository } from './repository/merchant.repository';
import { MerchantApprovalStatus } from './types/merchant.interface';

/** Merchants created by these staff roles need admin/super-admin approval before they can activate. */
const APPROVAL_REQUIRED_CHANNELS = ['sales', 'field-agent'];

@Injectable()
export class MerchantService {
  constructor(
    private readonly user: UserRepository,
    private readonly role: RoleRepository,
    private readonly shared: SharedService,
    private readonly merchant: MerchantRepository,
    private readonly payment: PaymentRepository,
  ) {}

  async find(query: QueryDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: ['merchant_name', 'merchant_phone', 'merchant_store_name'],
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
      approval_status: APPROVAL_REQUIRED_CHANNELS.includes(creatorRole.name)
        ? MerchantApprovalStatus.PENDING
        : MerchantApprovalStatus.APPROVED,
    };

    const merchant = await this.merchant.create(merchantPayload);

    const data = { ...merchant.toObject() };

    return { data, message: `Merchant successfully created` };
  }

  async findById(id: string): Promise<ServiceResponse<Merchant>> {
    const merchant = await this.merchant.findById(id, { populate: [{ path: 'user' }, { path: 'creator' }] });
    if (!merchant) throw new NotFoundException('Merchant not found');

    return { data: merchant, message: 'Merchant successfully fetched' };
  }

  async deactivate(id: string): Promise<ServiceResponse<Merchant>> {
    const merchant = await this.merchant.findById(id);
    if (!merchant) throw new NotFoundException('Merchant not found');

    const updated = await this.merchant.updateById(id, { is_active: false });

    return { data: updated, message: 'Merchant deactivated successfully' };
  }

  /**
   * Approves a merchant that was created by sales/field-agent staff. If a
   * confirmed activation payment already exists (the payment side already
   * checked approval_status and found it PENDING, so held off activating),
   * this is the "second condition finishes" branch that completes activation.
   */
  async approve(id: string): Promise<ServiceResponse<Merchant>> {
    const merchant = await this.merchant.findById(id);
    if (!merchant) throw new NotFoundException('Merchant not found');

    await this.merchant.updateById(id, { approval_status: MerchantApprovalStatus.APPROVED });

    if (!merchant.activated) {
      const confirmedPayment = await this.payment.findOne({
        merchant_id: merchant.merchant_id,
        type: PaymentType.ACTIVATION,
        status: PaymentStatus.PAID,
      });

      if (confirmedPayment) {
        await this.merchant.updateById(id, { activated: true, activated_at: new Date() });
        if (merchant.user_id) await this.user.updateOne({ _id: merchant.user_id }, { status: UserStatus.ACTIVE });
      }
    }

    const updated = await this.merchant.findById(id);

    return { data: updated, message: 'Merchant approved successfully' };
  }

  async reject(id: string): Promise<ServiceResponse<Merchant>> {
    const merchant = await this.merchant.findById(id);
    if (!merchant) throw new NotFoundException('Merchant not found');

    const updated = await this.merchant.updateById(id, { approval_status: MerchantApprovalStatus.REJECTED });

    return { data: updated, message: 'Merchant rejected successfully' };
  }
}
