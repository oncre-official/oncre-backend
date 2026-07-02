import { ObjectId } from 'mongodb';

import { UserStatus } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IAgent extends IBaseType {
  user_id?: ObjectId;
  created_by?: ObjectId;
  first_name: string;
  last_name: string;
  zone: string;
  status: UserStatus;
}
