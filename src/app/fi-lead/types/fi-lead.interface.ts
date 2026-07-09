import { IBaseType } from '@on/utils/types';

export enum NplVolumeBracket {
  UNDER_50M = 'UNDER_50M',
  BETWEEN_50M_500M = '50M_500M',
  ABOVE_500M = 'ABOVE_500M',
  UNDISCLOSED = 'UNDISCLOSED',
}

export enum FiLeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  LOST = 'LOST',
}

export interface IFiLead extends IBaseType {
  full_name: string;
  institution_name: string;
  npl_volume_bracket: NplVolumeBracket;
  work_email: string;
  phone_number: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  status: FiLeadStatus;
  bot_suspected: boolean;
}
