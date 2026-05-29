import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum CREDIT_STATUS {
  ACTIVE = 'active',
  DEFAULTED = 'defaulted',
  PAID = 'paid',
}

export interface ICredit extends IBaseType {
  ownerId: ObjectId;
  customerId: ObjectId;
  totalAmount: number;
  amountPaid: number;
  dueDate: Date;
  status: CREDIT_STATUS;
  enableCharges: boolean;
}

export interface ICreditNotification {
  ownerId: ObjectId;
  creditId: ObjectId;
  customerId: ObjectId;
  name: string;
  phone: string;
  amount: number;
}
