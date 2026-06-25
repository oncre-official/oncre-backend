import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum DisputeStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
}

export interface IDispute extends IBaseType {
  case_id: string;
  call_id: string;
  call_log_id: ObjectId;
  note: string;
  status: DisputeStatus;
  resolved_at: Date;
  escalated_at: Date;
  resolved_by: ObjectId;
  escalated_by: ObjectId;
}
