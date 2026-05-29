import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export interface ICustomer extends IBaseType {
  user_id?: ObjectId;
  customer_key: string;
  customer_name: string;
  customer_phone: string;
}
