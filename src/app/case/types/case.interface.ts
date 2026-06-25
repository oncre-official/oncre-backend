import { IBaseType } from '@on/utils/types';

export enum RecoveryMode {
  ESCALATION = 'ESCALATION',
  PAYMENT_PLAN = 'PAYMENT_PLAN',
  COMPLETED = 'COMPLETED',
}

export enum CaseStatus {
  ACTIVE = 'ACTIVE',
  LEGAL = 'LEGAL',
  WRITE_OFF = 'WRITE_OFF',
  DISPUTED = 'DISPUTED',
  COMPLETED = 'COMPLETED',
  PENDING_TRANSITION = 'PENDING_TRANSITION',
  FULLY_RECOVERED = 'FULLY_RECOVERED',
  PARTIALLY_RECOVERED = 'PARTIALLY_RECOVERED',
  WRITTEN_OFF = 'WRITTEN_OFF',
}

export interface ICase extends IBaseType {
  case_id: string;
  merchant_id: string;

  debtor_name: string;
  debtor_phone: string;
  debtor_address?: string;
  wholesaler_name?: string;

  amount: number;
  description?: string;
  due_date: Date;

  status: CaseStatus;
  escalation_level: number;
  current_day: number;

  is_paused: boolean;
  hold?: boolean;
  hold_until?: Date;
  pause_reason?: string;
  paused_at?: Date;
  paused_at_day?: number;
  paused_at_level?: number;
  activated_at: Date;

  recovery_mode?: RecoveryMode;
  payment_plan_id?: string;
  outstanding_balance?: number;

  transition_required?: boolean;
  transition_due_at?: Date;
  transition_completed_at?: Date;
}
