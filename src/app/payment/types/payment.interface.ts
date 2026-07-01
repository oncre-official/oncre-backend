import { ObjectId } from 'mongodb';

import { PaymentStatus } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export enum PaymentType {
  CASE = 'CASE',
  ACTIVATION = 'ACTIVATION',
}

export enum MerchantPaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export interface IPayment extends IBaseType {
  payment_id: string;
  merchant_id: string;
  case_id: string;
  type: PaymentType;
  amount: number;
  amount_paid: number;
  status: PaymentStatus;
  merchant_status: MerchantPaymentStatus;
  receipt_url: string;
  reference: string;
  provider: string;
  payment_url: string;
  uploaded_by: ObjectId;
  confirmed_by: ObjectId;
  rejection_reason: string;
  confirmed_at: Date;
  paid_at: Date;
}
