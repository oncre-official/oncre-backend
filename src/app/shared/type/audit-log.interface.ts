import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export interface IAuditLog extends IBaseType {
  user_id: ObjectId;
  action: string;
  route: string;
  method: string;
  reason: string;
  ip_address: string;
  user_agent: string;
}
