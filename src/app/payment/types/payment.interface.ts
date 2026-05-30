import { CasePaymentStatus } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IPayment extends IBaseType {
  payment_id: string;
  case_id: string;
  amount: number;
  amount_paid: number;
  status: CasePaymentStatus;
  reference: string;
  provider?: string;
  payment_url: string;
  paid_at: Date ;
}
