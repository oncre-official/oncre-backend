import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export interface IMerchant extends IBaseType {
  user_id?: ObjectId;
  created_by?: ObjectId;
  merchant_id: string;
  merchant_name: string;
  merchant_store_name: string;
  merchant_phone: string;
  location: string;
}
