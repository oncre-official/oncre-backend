import { ObjectId } from 'mongodb';

import { USER_STATUS } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IUser extends IBaseType {
  country_code: string;
  phone: string;
  email?: string;
  role_id: ObjectId;
  password: string;
  pin: string;
  phone_verified: boolean;
  email_verified: boolean;
  status: USER_STATUS;
  last_login: Date;
}
