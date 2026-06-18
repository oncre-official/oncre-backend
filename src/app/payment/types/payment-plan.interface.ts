import { IBaseType } from '@on/utils/types';

export enum InstallmentPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

export enum PaymentGenerationStatus {
  NOT_GENERATED = 'not_generated',
  GENERATED = 'generated',
}

export enum PaymentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
}

export enum PaymentFrequency {
  WEEKLY = 'weekly',
  CUSTOME = 'custom',
}

export interface IPaymentPlan extends IBaseType {
  plan_id: string;
  case_id: string;
  total_amount: number;
  total_paid: number;
  frequency: PaymentFrequency;
  status: PaymentPlanStatus;
}

export interface IPaymentInstallment extends IBaseType {
  installment_id: string;
  plan_id: string;
  case_id: string;
  amount: number;
  due_date: Date;
  status: InstallmentPaymentStatus;
  generation_status: PaymentGenerationStatus;
  payment_url: string;
  reference: string;
  amount_paid: number;
  paid_at: Date;
}
