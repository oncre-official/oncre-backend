import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CASH_ONLY = 'cash_only',
}

export interface ICustomer extends IBaseType {
  user_id?: ObjectId;
  created_by?: ObjectId;
  customer_id: string;
  customer_key: string;
  customer_phone: string;
  customer_name: string;
  customer_address: string;
  status: CustomerStatus;
  business_name?: string;
}

export interface ICreateCustomer {
  customer_key: string;
  customer_phone: string;
  customer_name?: string;
  business_name?: string;
  customer_address?: string;
  created_by?: ObjectId;
}
