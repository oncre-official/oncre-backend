import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum WalletTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum WalletTransactionReason {
  MERCHANT_ACTIVATION = 'MERCHANT_ACTIVATION',
  COMMISSION_PAYOUT = 'COMMISSION_PAYOUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export interface IWallet extends IBaseType {
  user_id: ObjectId;
  balance: number;
  total_credit: number;
  total_debit: number;
}

export interface IWalletTransaction extends IBaseType {
  user_id: ObjectId;
  transaction_id: string;
  type: WalletTransactionType;
  reason: WalletTransactionReason;
  amount: number;
  balance_before: number;
  balance_after: number;
  merchant_id: string;
  payment_id: string;
  payout_id: string;
  created_by: ObjectId;
  note: string;
}

export interface ICreditDebitWallet {
  user_id: ObjectId;
  amount: number;
  reason: string;
  created_by: ObjectId;
  merchant_id?: string;
  payment_id?: string;
  note?: string;
}
