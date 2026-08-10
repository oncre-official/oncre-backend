import crypto from 'crypto';

import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { config } from '@on/config';
import { PaymentStatus, UserStatus } from '@on/enum';
import { joinSearchQuery } from '@on/helpers/search';
import { PaystackService } from '@on/services/paystack/service';
import { IInitializePayment } from '@on/services/paystack/type';
import { ServiceResponse } from '@on/utils/types';

import { isCaseOnHold } from '../case/helper';
import { Case } from '../case/model/case.model';
import { CaseRepository } from '../case/repository/case.repository';
import { CallService } from '../case/services/call.service';
import { MessageService } from '../case/services/message.service';
import { CaseStatus, RecoveryMode } from '../case/types/case.interface';
import { MerchantRepository } from '../merchant/repository/merchant.repository';
import { MerchantApprovalStatus } from '../merchant/types/merchant.interface';
import { MessageRepository } from '../message/repository/message.repository';
import { SharedService } from '../shared/shared.service';
import { UserRepository } from '../user/repository/user.repository';

import { CreatePlanDto, TrancheType } from './dto/plan.dto';
import { QueryPaymentDto, QueryPaymentPlanDto } from './dto/query.dto';
import { RemittanceDto } from './dto/remittance.dto';
import { getInstallmentCount, getInstallmentDueDate } from './helpers';
import { PaymentInstallment } from './model/payment-installment.model';
import { PaymentPlan } from './model/payment-plan.model';
import { Payment } from './model/payment.model';
import { Remittance } from './model/remittance.model';
import { PaymentInstallmentRepository } from './repository/payment-installment.repository';
import { PaymentPlanRepository } from './repository/payment-plan.repository';
import { PaymentRepository } from './repository/payment.repository';
import { RemittanceRepository } from './repository/remittance.repository';
import { InstallmentPaymentStatus, PaymentFrequency, PaymentPlanStatus } from './types/payment-plan.interface';
import { PaymentType, RemittancePaymentStatus } from './types/payment.interface';
import { RemittanceStatus } from './types/remittance.interface';

import type { UserDocument } from '../user/model/user.model';
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
    private readonly user: UserRepository,
    private readonly merchant: MerchantRepository,
    private readonly caseMessage: MessageService,
    private readonly remittance: RemittanceRepository,
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

  async findPlan(query: QueryPaymentPlanDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [],
    });

    const strategies = {
      search: () => this.plan.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.plan.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'installments' }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'payments plan successfully fetched' };
  }

  async listInstallments(caseId: string): Promise<ServiceResponse<PaymentInstallment[]>> {
    const data = await this.installment.find({ case_id: caseId }, { sort: { due_date: 1 } });

    return { data, message: 'Installments successfully fetched' };
  }

  async createPlan(payload: CreatePlanDto): Promise<ServiceResponse<PaymentPlan>> {
    const { case_id, type, value } = payload;

    const installmentCount = getInstallmentCount(type, value);

    const existingCase = await this.cases.findOne({ case_id });
    if (!existingCase) throw new NotFoundException('Case not found');

    if (existingCase.recovery_mode === RecoveryMode.PAYMENT_PLAN)
      throw new BadRequestException('Case already on payment plan');
    if (existingCase.status === CaseStatus.COMPLETED) throw new BadRequestException('Case already completed');

    const existingPlan = await this.plan.findOne({ case_id, status: PaymentPlanStatus.ACTIVE });
    if (existingPlan) throw new ConflictException('An active payment plan already exists for this case');

    const planId = await this.shared.generateSequentialId('plan_id', 'PL', 5);

    const totalAmount = existingCase?.outstanding_balance || existingCase.amount;
    const installmentAmount = Math.ceil(totalAmount / installmentCount);

    const plan = await this.plan.create({
      plan_id: planId,
      case_id,
      total_amount: totalAmount,
      total_paid: 0,
      frequency: type === TrancheType.Month ? PaymentFrequency.CUSTOME : PaymentFrequency.WEEKLY,
      status: PaymentPlanStatus.ACTIVE,
    });

    for (let i = 0; i < installmentCount; i++) {
      const dueDate = getInstallmentDueDate(type, i);

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

  async remit(payload: RemittanceDto): Promise<ServiceResponse<Remittance>> {
    const { payment_id } = payload;

    const payment = await this.payment.findOne({ payment_id });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.PAID)
      throw new BadRequestException('Only fully paid payments can be remitted');
    if (!payment.merchant_id) throw new BadRequestException('Payment does not have a merchant');
    if (payment.remittance_status === RemittancePaymentStatus.REMITTED)
      throw new BadRequestException('Payment has already been remitted');

    const existing = await this.remittance.findOne({ payment_id });
    if (existing) throw new ConflictException('Remittance already exists for this payment');

    const commissionRate = 2;
    const grossAmount = payment.amount_paid;

    if (!grossAmount || grossAmount <= 0) throw new BadRequestException('Payment has no valid amount paid');

    const commissionAmount = this.calculateCommission(grossAmount, commissionRate);

    const netAmount = grossAmount - commissionAmount;

    const remittanceId = await this.shared.generateSequentialId('remittance_id', 'REM', 5);

    const remittance = await this.remittance.create({
      remittance_id: remittanceId,
      merchant_id: payment.merchant_id,
      case_id: payment.case_id,
      payment_id: payment.payment_id,
      gross_amount: grossAmount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      net_amount: netAmount,
      status: RemittanceStatus.PENDING,
      provider: payment.provider,
    });

    await payment.updateOne({
      remittance_id: remittanceId,
      remittance_status: RemittancePaymentStatus.PENDING,
    });

    this.logger.log(`Remittance ${remittanceId} created for payment ${payment_id}`);

    return { data: remittance, message: 'Payment remitted successfully' };
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
    if (payment?.type === PaymentType.ACTIVATION) return this.completeActivationPayment(payment, amountPaid);
    if (payment) return this.processDirect(payment, amountPaid);

    this.logger.log(`Webhook processing completed......`);

    return;
  }

  /**
   * UTILITY METHODS
   */
  async initiateActivation(
    user: UserDocument,
    callbackUrl?: string,
  ): Promise<ServiceResponse<{ payment_url: string; reference: string }>> {
    const merchant = await this.merchant.findOne({ user_id: user._id });
    if (!merchant) throw new NotFoundException('No merchant profile found for this account');
    if (merchant.activated) throw new ConflictException('Merchant is already activated');

    const existing = await this.payment.findOne({
      merchant_id: merchant.merchant_id,
      type: PaymentType.ACTIVATION,
      status: PaymentStatus.PENDING,
    });

    if (existing) {
      return {
        data: { payment_url: existing.payment_url, reference: existing.reference },
        message: 'Activation payment already pending',
      };
    }

    const reference = await this.shared.generateSequentialId('payment_id', 'PAY', 5);
    const amount = 5000;

    const paymentPayload: IInitializePayment = {
      email: user.email,
      amount: amount * 100,
      reference,
      metadata: { merchant_id: merchant.merchant_id, type: PaymentType.ACTIVATION },
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
    };

    const { paymentUrl } = await this.paystack.initiatePayment(paymentPayload);

    await this.payment.create({
      payment_id: reference,
      merchant_id: merchant.merchant_id,
      type: PaymentType.ACTIVATION,
      amount,
      amount_paid: 0,
      status: PaymentStatus.PENDING,
      reference,
      payment_url: paymentUrl,
      uploaded_by: user._id,
    });

    return { data: { payment_url: paymentUrl, reference }, message: 'Activation payment initialised' };
  }

  async verifyActivation(user: UserDocument, reference: string): Promise<ServiceResponse<{ activated: boolean }>> {
    const payment = await this.payment.findOne({ reference, type: PaymentType.ACTIVATION });
    if (!payment) throw new NotFoundException('Payment not found');

    const merchant = await this.merchant.findOne({ merchant_id: payment.merchant_id });
    if (!merchant || String(merchant.user_id) !== String(user._id)) throw new NotFoundException('Payment not found');

    if (payment.status === PaymentStatus.PAID)
      return { data: { activated: true }, message: 'Payment already confirmed' };

    try {
      const verification = await this.paystack.verifyPayment(reference);
      await this.completeActivationPayment(payment, verification.amount);
      return { data: { activated: true }, message: 'Payment confirmed. Account activated.' };
    } catch (error: any) {
      this.logger.log(`[Activation] verify not yet successful for ${reference}: ${error.message}`);
      return { data: { activated: false }, message: 'Payment not yet completed' };
    }
  }

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
    const status = totalPaid >= payment.amount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

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

  private async completeActivationPayment(payment: Payment, amountPaid: number): Promise<void> {
    if (payment.status === PaymentStatus.PAID) return;

    await this.payment.updateOne(
      { reference: payment.reference },
      { amount_paid: amountPaid, status: PaymentStatus.PAID, paid_at: new Date() },
    );

    const merchant = await this.merchant.findOne({ merchant_id: payment.merchant_id });

    // Merchants created by sales/field-agent staff need admin approval too — if it's still
    // pending, hold off activating; MerchantService#approve completes it once approved.
    if (merchant?.approval_status === MerchantApprovalStatus.PENDING) return;

    await this.merchant.updateOne({ merchant_id: payment.merchant_id }, { activated: true, activated_at: new Date() });
    if (merchant?.user_id) await this.user.updateOne({ _id: merchant.user_id }, { status: UserStatus.ACTIVE });
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

  private calculateCommission(amount: number, rate: number): number {
    return Number(((amount * rate) / 100).toFixed(2));
  }
}
