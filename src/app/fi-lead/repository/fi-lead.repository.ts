import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { FiLead, FiLeadDocument } from '../model/fi-lead.model';

export class FiLeadRepository extends BaseRepository<FiLeadDocument> {
  constructor(@InjectModel(FiLead.name) private fiLeadModel: Model<FiLeadDocument>) {
    super(fiLeadModel);
  }
}
