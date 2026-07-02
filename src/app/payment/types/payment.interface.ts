import { ObjectId } from 'mongodb';

import { PaymentStatus } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export enum PaymentType {
  CASE = 'CASE',
  ACTIVATION = 'ACTIVATION',
}

export enum PaymentAuditAction {
  APPROVED = 'APPROVED',
  FLAGGED = 'FLAGGED',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum MerchantPaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FLAGGED = 'flagged',
  FOLLOW_UP = 'follow_up',
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

export interface IPaymentAudit extends IBaseType {
  payment_id: string;
  merchant_id: string;
  type: PaymentType;
  admin_id: ObjectId;
  user_id: ObjectId;
  action: PaymentAuditAction;
  previous_status: MerchantPaymentStatus;
  new_status: MerchantPaymentStatus;
  reason: string;
  note: string;
  meta: Record<string, any>;
}
