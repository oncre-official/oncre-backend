import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { CallLog, CallLogDocument } from '../model/call-log.model';

export class CallLogRepository extends BaseRepository<CallLogDocument> {
  constructor(@InjectModel(CallLog.name) private callLogModel: Model<CallLogDocument>) {
    super(callLogModel);
  }
}
