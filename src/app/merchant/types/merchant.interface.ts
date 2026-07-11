import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum MerchantApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IMerchant extends IBaseType {
  user_id?: ObjectId;
  created_by?: ObjectId;
  merchant_id: string;
  merchant_name: string;
  merchant_store_name: string;
  merchant_phone: string;
  business_type?: string;
  location: string;
  activated: boolean;
  activated_at?: Date;
  channel: string;
  is_active: boolean;
  approval_status: MerchantApprovalStatus;
}

export interface ICreateMerchant {
  merchant_name: string;
  merchant_phone: string;
  merchant_store_name?: string;
  location?: string;
  created_by?: ObjectId;
}
