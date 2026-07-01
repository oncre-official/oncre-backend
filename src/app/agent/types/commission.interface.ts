import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum CommissionPayoutStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum CommissionPayoutMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  POS = 'POS',
  OTHER = 'OTHER',
}

export interface ICommissionPayout extends IBaseType {
  user_id: ObjectId;
  payout_id: string;
  amount: number;
  status: CommissionPayoutStatus;
  method: CommissionPayoutMethod;
  reference: string;
  note: string;
  paid_by: ObjectId;
  paid_at: Date;
}
