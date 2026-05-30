import { EscalationTier, EventType } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IRepayment extends IBaseType {
  credit_id: string;
  merchant_id: string;
  payment_amount: number;
  payment_date: Date;
  payment_type: string;
  event_type: EventType;
  paid_part_reengagement: boolean;
  new_due_date: Date ;
  escalation_tier: EscalationTier ;
  merchant_approval: boolean;
  escalation_start_date: Date ;
}
