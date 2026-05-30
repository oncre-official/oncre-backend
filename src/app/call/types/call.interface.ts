import { CallOutcomeStatus, CallType } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface ICall extends IBaseType {
  call_id: string;
  credit_id?: string;
  case_id?: string;
  merchant_id: string;
  debtor_phone?: string;
  day?: number;
  call_type: CallType;
  status: CallOutcomeStatus;
  scheduled_for: Date;
}

export interface ICallLog extends IBaseType {
  call_id: string;
  case_id: string;
  outcome: string;
  note?: string;
  called_at?: Date;
}
