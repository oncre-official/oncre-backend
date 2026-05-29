import { ObjectId } from 'mongodb';

import { USER_STATUS } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IUser extends IBaseType {
  countryCode: string;
  phone: string;
  email?: string;
  roleId: ObjectId;
  password: string;
  pin: string;
  phoneVerified: boolean;
  status: USER_STATUS;
  lastLogin: Date;
}
