import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Remittance, RemittanceDocument } from '../model/remittance.model';

export class RemittanceRepository extends BaseRepository<RemittanceDocument> {
  constructor(@InjectModel(Remittance.name) private remittanceModel: Model<RemittanceDocument>) {
    super(remittanceModel);
  }
}
