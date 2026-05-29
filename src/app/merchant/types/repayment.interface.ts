import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export interface IRepayment extends IBaseType {
  creditId: ObjectId;
  amount: number;
  date: Date;
}

export interface IRepaymentNotification {
  ownerId: ObjectId;
  creditId: ObjectId;
  customerId: ObjectId;
  name: string;
  phone: string;
  amount: number;
  totalPaid: number;
  totalAmount: number;
  isFullyPaid: boolean;
}
