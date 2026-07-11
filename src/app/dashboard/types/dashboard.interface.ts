export interface KpiSummary {
  total_active_cases: number;
  total_recovered_this_month: number;
  cases_in_call_queue_today: number;
  passive_cases: number;
}

export interface PaymentPipelineBucket {
  count: number;
  total: number;
}

export interface PaymentPipelineSummary {
  received: PaymentPipelineBucket;
  pending: PaymentPipelineBucket;
  missed: PaymentPipelineBucket;
}

export interface UpcomingPayment {
  installment_id: string;
  case_id: string;
  debtor_name: string;
  amount: number;
  due_date: Date;
}

export interface DashboardSummary {
  kpis: KpiSummary;
  payment_pipeline?: PaymentPipelineSummary;
  upcoming_payments?: UpcomingPayment[];
  generated_at: Date;
}
