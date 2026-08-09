import { IBaseType } from '@on/utils/types';

export enum RemittanceStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  REMITTED = 'remitted',
  FAILED = 'failed',
}

export interface IRemittance extends IBaseType {
  remittance_id: string;
  merchant_id: string;
  case_id: string;
  payment_id: string;
  plan_id: string;
  installment_id: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  status: RemittanceStatus;
  reference: string;
  provider: string;
  remitted_at: Date;
  failure_reason: string;
  meta: Record<string, any>;
}
