import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Credit, CreditDocument } from '../model/credit.model';

export class CreditRepository extends BaseRepository<CreditDocument> {
  constructor(@InjectModel(Credit.name) private creditModel: Model<CreditDocument>) {
    super(creditModel);
  }
}
