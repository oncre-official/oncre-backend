import { ObjectId } from 'mongodb';

import { ActionType, EscalationTier, MessageType } from '@on/enum';

export interface ServiceResponse<T> {
  data: T;
  message: string;
}

export interface ResponseDTO {
  success: boolean;
  data: null | object;
  message: string;
}

export interface IBaseType {
  _id?: ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

export interface TemplateContext {
  customer_name?: string;
  amount: string;
  merchant_name?: string;
  merchant_phone?: string;
  balance_amount?: string;
  paid_amount?: string;
  debtor_name?: string;
  case_id?: string;
  wholesaler_name?: string;
  goods?: string;
  due_date?: string;
  l2_deadline?: string;
  l3_deadline?: string;
  closure_date?: string;
  recovery_number?: string;
  payment_link?: string;
}

export interface ScheduledMessage {
  message_type: MessageType;
  message_index: number;
  message_tier: EscalationTier | null;
  action_type: ActionType;
  day_offset?: number; // days from reference date
  body_fn: (ctx: TemplateContext) => string;
  label: string;
  day?: number;
}
