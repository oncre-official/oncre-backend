import { ObjectId } from 'mongodb';

import { IBaseType } from '@on/utils/types';

export enum SettingType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

export enum SettingCategory {
  COMMISSION = 'COMMISSION',
  PLATFORM = 'PLATFORM',
  NOTIFICATION = 'NOTIFICATION',
  ESCALATION = 'ESCALATION',
}

export interface ISetting extends IBaseType {
  key: string;
  value: string;
  type: SettingType;
  category: SettingCategory;
  config?: Record<string, any>;
  description?: string;
  is_active: boolean;
  created_by?: ObjectId;
  updated_by?: ObjectId;
}
