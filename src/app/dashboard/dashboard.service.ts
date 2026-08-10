import { Injectable } from '@nestjs/common';

import { CallRepository } from '@on/app/call/repository/call.repository';
import { CaseRepository } from '@on/app/case/repository/case.repository';
import { CaseStatus } from '@on/app/case/types/case.interface';
import { PaymentInstallmentRepository } from '@on/app/payment/repository/payment-installment.repository';
import { PaymentRepository } from '@on/app/payment/repository/payment.repository';
import { InstallmentPaymentStatus } from '@on/app/payment/types/payment-plan.interface';
import { PaymentType } from '@on/app/payment/types/payment.interface';
import { RoleRepository } from '@on/app/role/repository/role.repository';
import { User } from '@on/app/user/model/user.model';
import { CallStatus, PaymentStatus } from '@on/enum';
import { addDaysUTC, calculateStartAndEndOfMonth, today } from '@on/helpers/date';
import { ServiceResponse } from '@on/utils/types';

import { QueryRemittanceOverviewDto } from '../payment/dto/remittance.dto';
import { RemittanceRepository } from '../payment/repository/remittance.repository';
import { RemittanceStatus } from '../payment/types/remittance.interface';

import {
  DashboardSummary,
  EscalationPipelineBucket,
  PaymentPipelineBucket,
  UpcomingPayment,
} from './types/dashboard.interface';

const DASHBOARD_PAYMENT_ROLES = ['admin', 'super-admin'];

@Injectable()
export class DashboardService {
  constructor(
    private readonly role: RoleRepository,
    private readonly cases: CaseRepository,
    private readonly calls: CallRepository,
    private readonly payments: PaymentRepository,
    private readonly remittance: RemittanceRepository,
    private readonly installments: PaymentInstallmentRepository,
  ) {}

  async summary(user: User): Promise<ServiceResponse<DashboardSummary>> {
    const role = await this.role.findById(user.role_id);
    const canViewPayments = DASHBOARD_PAYMENT_ROLES.includes(role?.name);

    const [kpis, escalation_pipeline, payment_pipeline, upcoming_payments] = await Promise.all([
      this.computeKpis(),
      this.computeEscalationPipeline(),
      canViewPayments ? this.computePaymentPipeline() : Promise.resolve(undefined),
      canViewPayments ? this.computeUpcomingPayments() : Promise.resolve(undefined),
    ]);

    return {
      data: { kpis, escalation_pipeline, payment_pipeline, upcoming_payments, generated_at: new Date() },
      message: 'Dashboard summary fetched successfully',
    };
  }

  async remittanceOverview(query: QueryRemittanceOverviewDto): Promise<ServiceResponse<any>> {
    const { merchant_id, start_date: date_from, end_date: date_to } = query;

    const match: Record<string, any> = {};

    if (merchant_id) match.merchant_id = merchant_id;
    if (date_from || date_to) {
      match.createdAt = {};
      if (date_from) match.createdAt.$gte = new Date(date_from);

      if (date_to) {
        const endDate = new Date(date_to);

        endDate.setHours(23, 59, 59, 999);
        match.createdAt.$lte = endDate;
      }
    }

    const result: any = await this.remittance.aggregate([
      { $match: match },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total_remittances: { $sum: 1 },
                total_gross_amount: { $sum: '$gross_amount' },
                total_commission: { $sum: '$commission_amount' },
                total_net_amount: { $sum: '$net_amount' },
              },
            },
          ],
          status_breakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                amount: { $sum: '$net_amount' },
                gross_amount: { $sum: '$gross_amount' },
                commission_amount: { $sum: '$commission_amount' },
              },
            },
          ],
        },
      },
    ]);

    const totals = result[0]?.totals?.[0] || {
      total_remittances: 0,
      total_gross_amount: 0,
      total_commission: 0,
      total_net_amount: 0,
    };

    const statusBreakdown = result[0]?.status_breakdown || [];

    const getStatus = (status: RemittanceStatus) =>
      statusBreakdown.find((item) => item._id === status) || {
        count: 0,
        amount: 0,
        gross_amount: 0,
        commission_amount: 0,
      };

    const completed = getStatus(RemittanceStatus.REMITTED);
    const pending = getStatus(RemittanceStatus.PENDING);
    const processing = getStatus(RemittanceStatus.PROCESSING);
    const failed = getStatus(RemittanceStatus.FAILED);

    return {
      data: {
        total_remittances: totals.total_remittances,
        total_gross_amount: totals.total_gross_amount,
        total_commission: totals.total_commission,
        total_net_amount: totals.total_net_amount,
        completed: {
          count: completed.count,
          amount: completed.amount,
        },
        pending: {
          count: pending.count,
          amount: pending.amount,
        },
        processing: {
          count: processing.count,
          amount: processing.amount,
        },
        failed: {
          count: failed.count,
          amount: failed.amount,
        },
      },

      message: 'Remittance overview retrieved successfully',
    };
  }

  /**
   * PRIVATE METHODS
   */
  private async computeKpis() {
    const startOfToday = today();
    const startOfTomorrow = addDaysUTC(startOfToday, 1);
    const { start: startOfMonth, end: endOfMonth } = calculateStartAndEndOfMonth();

    const [total_active_cases, total_recovered_this_month, cases_in_call_queue_today, passive_cases] =
      await Promise.all([
        this.cases.count({ status: CaseStatus.ACTIVE, is_paused: { $ne: true }, hold: { $ne: true } }),
        this.cases.count({ recovered_at: { $gte: startOfMonth, $lte: endOfMonth } }),
        this.calls.count({
          scheduled_for: { $gte: startOfToday, $lt: startOfTomorrow },
          status: { $in: [CallStatus.SCHEDULED, CallStatus.PENDING] },
        }),
        this.cases.count({ $or: [{ is_paused: true }, { hold: true }] }),
      ]);

    return { total_active_cases, total_recovered_this_month, cases_in_call_queue_today, passive_cases };
  }

  private async computeEscalationPipeline(): Promise<EscalationPipelineBucket[]> {
    const rows = (await this.cases.aggregate([
      { $match: { status: CaseStatus.ACTIVE, is_paused: { $ne: true }, hold: { $ne: true } } },
      { $group: { _id: '$escalation_level', count: { $sum: 1 } } },
    ])) as unknown as { _id: number; count: number }[];

    const byLevel = new Map(rows.map((row) => [row._id, row.count]));

    return [1, 2, 3, 4].map((level) => ({ level, count: byLevel.get(level) ?? 0 }));
  }

  private async computePaymentPipeline() {
    const rows = (await this.payments.aggregate([
      { $match: { type: PaymentType.CASE } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: { $ifNull: ['$amount', 0] } } } },
    ])) as unknown as { _id: string; count: number; total: number }[];

    const byStatus: Record<string, PaymentPipelineBucket> = Object.fromEntries(
      rows.map((row) => [row._id, { count: row.count, total: row.total }]),
    );

    const empty: PaymentPipelineBucket = { count: 0, total: 0 };
    const received = byStatus[PaymentStatus.PAID] ?? empty;
    const pending = byStatus[PaymentStatus.PENDING] ?? empty;
    const partial = byStatus[PaymentStatus.PARTIAL] ?? empty;
    const missed = byStatus[PaymentStatus.FAILED] ?? empty;

    return {
      received,
      pending: { count: pending.count + partial.count, total: pending.total + partial.total },
      missed,
    };
  }

  private getMondayToSundayRange(): { start: Date; end: Date } {
    const t = today();
    const daysSinceMonday = t.getUTCDay() === 0 ? 6 : t.getUTCDay() - 1;
    const start = addDaysUTC(t, -daysSinceMonday);
    return { start, end: addDaysUTC(start, 7) };
  }

  private async computeUpcomingPayments(): Promise<UpcomingPayment[]> {
    const { start, end } = this.getMondayToSundayRange();

    const installments = await this.installments.find(
      { due_date: { $gte: start, $lt: end }, status: InstallmentPaymentStatus.PENDING },
      { populate: [{ path: 'case' }], sort: { due_date: 1 } },
    );

    return installments.map((installment) => ({
      installment_id: installment.installment_id,
      case_id: installment.case_id,
      debtor_name: installment.case?.debtor_name ?? 'Unknown',
      amount: installment.amount,
      due_date: installment.due_date,
    }));
  }
}
