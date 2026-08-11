import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Setting, SettingDocument } from '../model/setting.model';

export class SettingRepository extends BaseRepository<SettingDocument> {
  constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) {
    super(settingModel);
  }
}
