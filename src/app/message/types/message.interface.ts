import { ActionType, EscalationTier, MessageDeliveryStatus, MessageType } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IMessage extends IBaseType {
  credit_id: string;
  case_id?: string;
  merchant_id: string;
  customer_key: string;
  customer_phone: string;
  debtor_phone?: string;
  day?: number;
  message_type: MessageType;
  message_tier: EscalationTier | null;
  message_index: number;
  action_type: ActionType;
  message_body: string;
  scheduled_for: Date;
  sent_at: Date | null;
  delivery_status: MessageDeliveryStatus;
  termii_message_id: string | null;
  error_details: string | null;
  cancelled_reason: string | null;
}
