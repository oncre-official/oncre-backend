import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Merchant, MerchantDocument } from '../model/merchant.model';

export class MerchantRepository extends BaseRepository<MerchantDocument> {
  constructor(@InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>) {
    super(merchantModel);
  }
}
