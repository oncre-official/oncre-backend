import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Dispute, DisputeDocument } from '../model/dispute.model';

export class DisputeRepository extends BaseRepository<DisputeDocument> {
  constructor(@InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>) {
    super(disputeModel);
  }
}
