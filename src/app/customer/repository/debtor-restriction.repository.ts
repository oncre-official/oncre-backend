import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { DebtorRestriction, DebtorRestrictionDocument } from '../model/debtor-restriction.model';

export class DebtorRestrictionRepository extends BaseRepository<DebtorRestrictionDocument> {
  constructor(@InjectModel(DebtorRestriction.name) private debtorRestrictionModel: Model<DebtorRestrictionDocument>) {
    super(debtorRestrictionModel);
  }
}
