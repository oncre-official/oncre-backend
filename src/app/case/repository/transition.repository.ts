import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Transition, TransitionDocument } from '../model/transition.model';

export class TransitionRepository extends BaseRepository<TransitionDocument> {
  constructor(@InjectModel(Transition.name) private transitionModel: Model<TransitionDocument>) {
    super(transitionModel);
  }
}
