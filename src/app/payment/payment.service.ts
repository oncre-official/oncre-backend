import crypto from 'crypto';

import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { config } from '@on/config';
import { PaymentStatus } from '@on/enum';
import { joinSearchQuery } from '@on/helpers/search';
import { PaystackService } from '@on/services/paystack/service';
import { IInitializePayment } from '@on/services/paystack/type';
import { ServiceResponse } from '@on/utils/types';

import { isCaseOnHold } from '../case/helper/indexx';
import { Case } from '../case/model/case.model';
import { CaseRepository } from '../case/repository/case.repository';
import { CallService } from '../case/services/call.service';
import { MessageService } from '../case/services/message.service';
import { CaseStatus, RecoveryMode } from '../case/types/case.interface';
import { MessageRepository } from '../message/repository/message.repository';
import { SharedService } from '../shared/shared.service';

import { CreatePlanDto } from './dto/plan.dto';
import { QueryPaymentDto } from './dto/query.dto';
import { convertToWeeks } from './helpers';
import { PaymentInstallment } from './model/payment-installment.model';
import { PaymentPlan } from './model/payment-plan.model';
import { Payment } from './model/payment.model';
import { PaymentInstallmentRepository } from './repository/payment-installment.repository';
import { PaymentPlanRepository } from './repository/payment-plan.repository';
import { PaymentRepository } from './repository/payment.repository';
import { InstallmentPaymentStatus, PaymentPlanStatus } from './types/payment-plan.interface';

import type { Request } from 'express';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly cases: CaseRepository,
    private readonly shared: SharedService,
    private readonly caseCall: CallService,
    private readonly payment: PaymentRepository,
    private readonly paystack: PaystackService,
    private readonly message: MessageRepository,
    private readonly plan: PaymentPlanRepository,
    private readonly caseMessage: MessageService,
    private readonly installment: PaymentInstallmentRepository,
  ) {}

  async find(query: QueryPaymentDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [],
    });

    const strategies = {
      search: () => this.payment.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.payment.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'payments successfully fetched' };
  }

  async createPlan(payload: CreatePlanDto): Promise<ServiceResponse<PaymentPlan>> {
    const { case_id, type, value } = payload;

    const weeks = convertToWeeks(type, value);

    const existingCase = await this.cases.findOne({ case_id });
    if (!existingCase) throw new NotFoundException('Case not found');

    if (existingCase.recovery_mode === RecoveryMode.PAYMENT_PLAN)
      throw new BadRequestException('Case already on payment plan');
    if (existingCase.status === 'COMPLETED') throw new BadRequestException('Case already completed');

    const existingPlan = await this.plan.findOne({ case_id, status: PaymentPlanStatus.ACTIVE });
    if (existingPlan) throw new ConflictException('An active payment plan already exists for this case');

    const planId = await this.shared.generateSequentialId('plan_id', 'PL', 5);

    const totalAmount = existingCase?.outstanding_balance || existingCase.amount;
    const installmentAmount = Math.ceil(totalAmount / weeks);

    const plan = await this.plan.create({
      plan_id: planId,
      case_id,
      total_amount: totalAmount,
      total_paid: 0,
      frequency: 'weekly',
      status: PaymentPlanStatus.ACTIVE,
    });

    for (let i = 0; i < weeks; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i + 1) * 7);

      await this.installment.create({
        plan_id: planId,
        case_id,
        amount: installmentAmount,
        amount_paid: 0,
        due_date: dueDate,
      });
    }

    await this.cases.updateOne(
      { case_id },
      {
        $set: {
          recovery_mode: 'PAYMENT_PLAN',
          payment_plan_id: planId,
          is_paused: true,
        },
      },
    );

    await Promise.all([
      this.caseMessage.cancel(existingCase, 'Payment plan created'),
      this.caseCall.cancel(existingCase, 'Payment plan created'),
      this.scheduleMessages(existingCase),
    ]);

    return { data: plan, message: `Payment plan created successfully` };
  }

  async handleWebhook(req: Request) {
    this.logger.log(`Webhook came in, processing payment......`);

    const signature = req.headers['x-paystack-signature'] as string;

    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const hash = crypto.createHmac('sha512', config.paystack.secretKey).update(body).digest('hex');
    if (hash !== signature) throw new BadRequestException('Invalid signature');

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (event.event !== 'charge.success') return;

    const { reference, amount } = event.data;

    const amountPaid = amount / 100;

    const installment = await this.installment.findOne({ reference });
    if (installment) return this.processInstallment(installment, amountPaid);

    const payment = await this.payment.findOne({ reference });
    if (payment) return this.processDirect(payment, amountPaid);

    this.logger.log(`Webhook processing completed......`);

    return;
  }

  /**
   * UTILITY METHODS
   */
  async createPaymentLink(existingCase: Case, amount: number) {
    const { case_id } = existingCase;

    const ref = await this.shared.generateSequentialId('payment_id', 'PAY', 5);

    const paymentPayload: IInitializePayment = {
      email: 'yoyoplenty@gmail.com',
      amount: amount * 100 || existingCase.amount * 100,
      reference: ref,
      metadata: { case_id },
    };

    const { paymentUrl, reference } = await this.paystack.initiatePayment(paymentPayload);

    await this.payment.create({
      case_id,
      payment_id: reference,
      amount: amount || existingCase.amount,
      amount_paid: 0,
      status: 'pending',
      reference,
      payment_url: paymentUrl,
    });

    return { paymentUrl, reference };
  }

  /**
   * PRIVATE METHODS
   */
  private async scheduleMessages(existingCase: Case) {
    const { case_id, debtor_phone, merchant_id } = existingCase;

    if (isCaseOnHold(existingCase)) return;

    const insts = await this.installment.find({ case_id }, { sort: { due_date: -1 } });

    let scheduled = 0;

    for (let i = 0; i < insts.length; i++) {
      const inst = insts[i];

      const body = 'Pending message generation';

      await this.message.create({
        case_id,
        merchant_id,
        debtor_phone,
        customer_key: 'debtor',
        customer_phone: debtor_phone,
        message_type: 'payment_plan',
        message_index: i,
        action_type: 'sms',
        message_body: body,
        scheduled_for: inst.due_date,
        delivery_status: 'scheduled',
        payment_link_generated: false,
      });

      scheduled++;
    }

    return scheduled;
  }

  private async processInstallment(installment: PaymentInstallment, amountPaid: number) {
    const { installment_id, plan_id, reference, case_id } = installment;

    if (installment.status === InstallmentPaymentStatus.PAID) throw new BadRequestException('Already processed');

    const theCase = await this.cases.findOne({ case_id });

    const totalPaid = installment.amount_paid + amountPaid;
    const status = totalPaid >= installment.amount ? InstallmentPaymentStatus.PAID : InstallmentPaymentStatus.PENDING;

    await this.installment.updateOne(
      { installment_id },
      {
        amount_paid: totalPaid,
        status,
        paid_at: status === InstallmentPaymentStatus.PAID ? new Date() : null,
      },
    );

    await this.plan.updateOne({ plan_id }, { $inc: { total_paid: amountPaid } });

    await this.updatePaymentRecord(reference, totalPaid, status);

    await this.completePlan(plan_id, theCase);

    return;
  }

  private async processDirect(payment: Payment, amountPaid: number) {
    const { reference, case_id } = payment;

    const totalPaid = payment.amount_paid + amountPaid;
    const status = totalPaid >= payment.amount ? PaymentStatus.PAID : PaymentStatus.PART_PAID;

    const theCase = await this.cases.findOne({ case_id });

    await this.payment.updateOne(
      { reference },
      {
        amount_paid: totalPaid,
        status,
        paid_at: new Date(),
      },
    );

    if (status === PaymentStatus.PAID) {
      await this.cases.updateOne(
        { case_id },
        {
          $set: {
            status: CaseStatus.COMPLETED,
            is_paused: true,
            completed_at: new Date(),
          },
        },
      );

      await Promise.all([
        this.caseMessage.cancel(theCase, 'Payment completed'),
        this.caseCall.cancel(theCase, 'Payment completed'),
      ]);
    }

    return;
  }

  private async updatePaymentRecord(reference: string, amountPaid: number, status: string): Promise<void> {
    const payment = await this.payment.findOne({ reference });
    if (!payment) return;

    await this.payment.updateOne({ reference }, { amount_paid: amountPaid, status, paid_at: new Date() });
  }

  private async completePlan(planId: string, theCase: Case): Promise<void> {
    const { case_id } = theCase;

    const remaining = await this.installment.count({
      plan_id: planId,
      status: { $ne: InstallmentPaymentStatus.PAID },
    });

    if (remaining > 0) return;

    await this.plan.updateOne({ plan_id: planId }, { status: PaymentPlanStatus.COMPLETED });

    await this.cases.updateOne(
      { case_id },
      {
        $set: {
          status: CaseStatus.COMPLETED,
          recovery_mode: RecoveryMode.COMPLETED,
          is_paused: true,
          completed_at: new Date(),
        },
      },
    );

    await Promise.all([
      this.caseMessage.cancel(theCase, 'Payment completed'),
      this.caseCall.cancel(theCase, 'Payment completed'),
    ]);
  }
}
