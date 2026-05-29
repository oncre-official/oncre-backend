import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Repayment, RepaymentDocument } from '../model/repayment.model';

export class RepaymentRepository extends BaseRepository<RepaymentDocument> {
  constructor(@InjectModel(Repayment.name) private repaymentModel: Model<RepaymentDocument>) {
    super(repaymentModel);
  }
}
