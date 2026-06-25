import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum TransitionOutcome {
  FULLY_RECOVERED = 'FULLY_RECOVERED',
  PARTIALLY_RECOVERED = 'PARTIALLY_RECOVERED',
  ESCALATE_TO_LEGAL = 'ESCALATE_TO_LEGAL',
  WRITE_OFF = 'WRITE_OFF',
}

export interface ITransition extends IBaseType {
  case_id: string;
  note: string;
  actioned_by: ObjectId;
  outcome: TransitionOutcome;
  actioned_at: Date;
}
