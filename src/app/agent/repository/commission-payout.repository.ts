import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { CommissionPayout, CommissionPayoutDocument } from '../model/commission-payout.model';

export class CommissionPayoutRepository extends BaseRepository<CommissionPayoutDocument> {
  constructor(@InjectModel(CommissionPayout.name) private commissionPayoutModel: Model<CommissionPayoutDocument>) {
    super(commissionPayoutModel);
  }
}
