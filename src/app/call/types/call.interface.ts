import { CallStatus, CallType } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface ICall extends IBaseType {
  call_id: string;
  credit_id?: string;
  case_id?: string;
  merchant_id: string;
  debtor_phone?: string;
  day?: number;
  call_type: CallType;
  status: CallStatus;
  scheduled_for: Date;
}
