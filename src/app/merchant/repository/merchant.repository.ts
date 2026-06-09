import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RoleRepository } from '@on/app/role/repository/role.repository';
import { SharedService } from '@on/app/shared/shared.service';
import { UserRepository } from '@on/app/user/repository/user.repository';
import { UserStatus } from '@on/enum';
import { escapeRegex } from '@on/helpers';
import { generatePassword } from '@on/helpers/password';
import { formatPhoneWithCode, parsePhone } from '@on/helpers/phone';
import { buildUserLookupQuery } from '@on/helpers/user';
import { BaseRepository } from '@on/repository/base.repository';

import { Merchant, MerchantDocument } from '../model/merchant.model';
import { ICreateMerchant } from '../types/merchant.interface';

export class MerchantRepository extends BaseRepository<MerchantDocument> {
  constructor(
    private readonly user: UserRepository,
    private readonly role: RoleRepository,
    private readonly shared: SharedService,
    @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
  ) {
    super(merchantModel);
  }

  async findOrCreate(payload: ICreateMerchant): Promise<MerchantDocument> {
    const { merchant_name, merchant_phone, created_by, ...others } = payload;

    const normalizedName = merchant_name.trim();
    const merchantRegex = { $regex: `^${escapeRegex(normalizedName)}$`, $options: 'i' };

    const userLookup = buildUserLookupQuery(merchant_phone);
    const conditions = [userLookup];

    let merchant = await this.findOne({ merchant_name: merchantRegex });

    const normalizedPhone = formatPhoneWithCode(merchant_phone);
    const { code, phone } = parsePhone(normalizedPhone);

    const role = await this.role.findOne({ name: 'merchant' }).catch(() => null);

    if (merchant) {
      if (!merchant.user_id) {
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

        merchant = await this.updateById(merchant._id, {
          user_id: user._id,
          ...others,
        });
      }

      return merchant;
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

    const merchantId = await this.shared.generateSequentialId('merchant_id', 'MER', 5);

    merchant = await this.create({
      ...payload,
      merchant_id: merchantId,
      user_id: user._id,
      ...(created_by && { created_by }),
    });

    return merchant;
  }
}
