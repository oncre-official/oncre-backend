import { IBaseType } from '@on/utils/types';

export interface ICallLog extends IBaseType {
  call_id: string;
  case_id: string;
  outcome: string;
  note?: string;
  called_at?: Date;
}
