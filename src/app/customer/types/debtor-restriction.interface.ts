import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum DebtorRestrictionStatus {
  CASH_ONLY = 'cash_only',
  ACTIVE = 'active',
}

export interface IDebtorRestriction extends IBaseType {
  customer_id: string;
  status: DebtorRestrictionStatus;
  reason?: string;
  actioned_by: ObjectId;
  actioned_at: Date;
}
