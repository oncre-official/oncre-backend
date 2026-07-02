import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PaymentStatus, UserStatus } from '@on/enum';
import { normalizePhoneNumber } from '@on/helpers';
import { calculateStartAndEndOfDay } from '@on/helpers/date';
import { generatePassword } from '@on/helpers/password';
import { joinSearchQuery } from '@on/helpers/search';
import { TermiiService } from '@on/services/termii/service';
import { ServiceResponse } from '@on/utils/types';

import { Merchant } from '../merchant/model/merchant.model';
import { MerchantRepository } from '../merchant/repository/merchant.repository';
import { Payment } from '../payment/model/payment.model';
import { PaymentRepository } from '../payment/repository/payment.repository';
import { MerchantPaymentStatus, PaymentType } from '../payment/types/payment.interface';
import { RoleRepository } from '../role/repository/role.repository';
import { SharedService } from '../shared/shared.service';
import { User } from '../user/model/user.model';
import { UserRepository } from '../user/repository/user.repository';

import { ActivationPaymentDto, ActivationStatus, ConfirmActivationPaymentDto } from './dto/activation.dto';
import { CommissionPayoutDto } from './dto/payout.dto';
import { QueryAgentDto, QueryCommissionDto } from './dto/query.dto';
import { CommissionPayout } from './model/commission-payout.model';
import { CommissionPayoutRepository } from './repository/commission-payout.repository';
import { WalletTransactionRepository } from './repository/wallet-transaction.repository';
import { WalletRepository } from './repository/wallet.repository';
import { CommissionPayoutStatus } from './types/commission.interface';
import { ICreditDebitWallet, IWallet, WalletTransactionReason, WalletTransactionType } from './types/wallet.interface';

@Injectable()
export class AgentService {
  constructor(
    private readonly role: RoleRepository,
    private readonly user: UserRepository,
    private readonly termii: TermiiService,
    private readonly shared: SharedService,
    private readonly wallet: WalletRepository,
    private readonly payment: PaymentRepository,
    private readonly merchant: MerchantRepository,
    private readonly payout: CommissionPayoutRepository,
    private readonly transaction: WalletTransactionRepository,
  ) {}

  async find(query: QueryAgentDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const role = await this.role.findOne({ name: 'field-agent' });
    if (!role) throw new NotFoundException('Agent role not found');

    const filter = { ...query, role_id: role._id };

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query: filter,
      joins: [],
    });

    const strategies = {
      search: () => this.user.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.user.findAndCount(filter, {
          aggregate: { skip, limit },
          populate: [],
          sort: { created_at: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'Agent successfully fetched' };
  }

  async commissionSummary(
    query: QueryCommissionDto,
    skip: number = 0,
    limit: number = 20,
  ): Promise<ServiceResponse<any>> {
    const { search, user_id, start_date, end_date } = query;

    const role = await this.role.findOne({ name: 'field-agent' });
    if (!role) throw new NotFoundException('Agent role not found');

    const filter: any = { role_id: role._id };
    if (user_id) filter._id = user_id;

    const joinQuery = joinSearchQuery({
      search,
      fields: ['first_name', 'last_name', 'email', 'phone'],
      query: filter,
      joins: [],
    });

    const populate = [{ path: 'agent' }];

    const strategies = {
      search: () =>
        this.user.aggregateAndCount(joinQuery, { aggregate: { skip, limit }, populate, sort: { created_at: -1 } }),
      normal: () =>
        this.user.findAndCount(filter, {
          aggregate: { skip, limit },
          populate,
          sort: { created_at: -1 },
        }),
    };

    const users = search ? await strategies.search() : await strategies.normal();

    const { start, end } = calculateStartAndEndOfDay(start_date, end_date);

    const data = await Promise.all(
      users.row.map(async (user) => {
        const wallet = await this.wallet.findOne({ user_id: user._id });

        const merchants = await this.merchant.find({
          created_by: user._id,
          created_at: { $gte: start, $lte: end },
        });

        const merchantIds = merchants.map((x) => x.merchant_id);
        const payments = merchantIds.length ? await this.payment.find({ merchant_id: { $in: merchantIds } }) : [];

        const confirmedPayments = payments.filter(
          (payment) => payment.merchant_status === MerchantPaymentStatus.CONFIRMED,
        );
        const pendingPayments = payments.filter((payment) => payment.merchant_status === MerchantPaymentStatus.PENDING);
        const confirmedCommission = confirmedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const pendingCommission = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

        return {
          ...user.toObject(),
          total_activations: payments.length,
          confirmed_activations: confirmedPayments.length,
          pending_verification: pendingPayments.length,
          confirmed_commission: confirmedCommission * 0.1,
          pending_commission: pendingCommission * 0.1,
          total_due: wallet?.balance || 0,
          total_paid: wallet?.total_debit || 0,
        };
      }),
    );

    const supervisorConfirmed = data.reduce((sum, row) => sum + row.confirmed_activations, 0);

    return {
      data: {
        data,
        count: users.count,
        supervisor: {
          confirmed_activations: supervisorConfirmed,
          commission: supervisorConfirmed * 1500,
        },
        week: {
          start_date: start_date,
          end_date: end_date,
        },
      },
      message: 'Commission summary fetched successfully.',
    };
  }

  async activationFee(user: User, payload: ActivationPaymentDto): Promise<ServiceResponse<Payment>> {
    const { merchant_id, amount, receipt_url, reference } = payload;

    const merchant = await this.merchant.findOne({ merchant_id });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const confirmedPayment = await this.payment.findOne({
      merchant_id,
      merchant_status: MerchantPaymentStatus.CONFIRMED,
      type: PaymentType.ACTIVATION,
    });

    if (confirmedPayment) throw new ConflictException('Merchant activation payment has already been confirmed.');

    const pendingPayment = await this.payment.findOne({
      merchant_id,
      merchant_status: MerchantPaymentStatus.PENDING,
      type: PaymentType.ACTIVATION,
    });

    if (pendingPayment) throw new ConflictException('There is already a pending activation payment awaiting approval.');

    const paymentId = await this.shared.generateSequentialId('merchant_payment_id', 'M-PAY', 6);

    const payment = await this.payment.create({
      payment_id: paymentId,
      merchant_id,
      uploaded_by: user._id,
      amount,
      receipt_url,
      reference,
      type: PaymentType.ACTIVATION,
      status: MerchantPaymentStatus.PENDING,
      merchant_status: MerchantPaymentStatus.PENDING,
    });

    return {
      data: payment,
      message: 'Merchant activation payment uploaded successfully.',
    };
  }

  async confirmActivation(admin: User, payload: ConfirmActivationPaymentDto): Promise<ServiceResponse<Payment>> {
    const { payment_id, status, rejection_reason } = payload;

    let result: any = {};

    const payment = await this.payment.findOne({ payment_id, type: PaymentType.ACTIVATION });
    if (!payment) throw new NotFoundException('Merchant payment not found');
    if (payment.merchant_status !== MerchantPaymentStatus.PENDING)
      throw new BadRequestException('Payment has already been processed.');

    const merchant = await this.merchant.findOne({ merchant_id: payment.merchant_id });
    if (!merchant) throw new NotFoundException('Merchant not found.');

    const agent = await this.user.findOne({ _id: merchant.created_by });
    if (!agent) throw new NotFoundException('Merchant owner not found.');

    switch (status) {
      case ActivationStatus.REJECTED:
        {
          await payment.updateOne({
            status: PaymentStatus.UNPAID,
            merchant_status: MerchantPaymentStatus.REJECTED,
            rejection_reason,
            confirmed_by: admin._id,
            confirmed_at: new Date(),
          });

          result = {
            data: payment,
            message: 'Merchant payment rejected successfully.',
          };
        }
        break;
      case ActivationStatus.APPROVED: {
        const commission = payment.amount * 0.1;

        await payment.updateOne({
          status: PaymentStatus.PAID,
          merchant_status: MerchantPaymentStatus.CONFIRMED,
          confirmed_by: admin._id,
          confirmed_at: new Date(),
        });

        await Promise.all([
          this.credit({
            user_id: agent._id,
            amount: commission,
            reason: WalletTransactionReason.MERCHANT_ACTIVATION,
            merchant_id: merchant.merchant_id,
            payment_id,
            created_by: admin._id,
            note: `Commission for merchant ${merchant.merchant_name}`,
          }),
          merchant.updateOne({ activated: true }),
          this.user.updateOne({ _id: merchant.user_id }, { status: UserStatus.ACTIVE }),
          this.sendActivationSMS(merchant),
        ]);

        result = {
          data: payment,
          message: 'Merchant payment confirmed successfully.',
        };
        break;
      }

      default:
        throw new BadRequestException(`Invalid activation status`);
    }

    return result;
  }

  async commissionPayout(admin: User, payload: CommissionPayoutDto): Promise<ServiceResponse<CommissionPayout>> {
    const { user_id, amount } = payload;

    const wallet = await this.wallet.findOne({ user_id });
    if (!wallet) throw new NotFoundException('Agent wallet not found.');
    if (wallet.balance < payload.amount) throw new BadRequestException('Insufficient wallet balance.');

    const payoutId = await this.shared.generateSequentialId('commission_payout_id', 'CP', 6);

    const payout = await this.payout.create({
      payout_id: payoutId,
      user_id: payload.user_id,
      amount: payload.amount,
      method: payload.method,
      reference: payload.reference,
      note: payload.note,
      paid_by: admin._id,
      paid_at: new Date(),
      status: CommissionPayoutStatus.PAID,
    });

    await this.debit({
      user_id,
      amount,
      reason: WalletTransactionReason.COMMISSION_PAYOUT,
      created_by: admin._id,
      note: `Commission for payout ${payoutId}`,
    });

    return { data: payout, message: 'Commission payout logged successfully.' };
  }

  /**
   * PRIVATE METHODS
   */

  private async credit(payload: ICreditDebitWallet): Promise<IWallet> {
    const { user_id, amount, reason, merchant_id, payment_id, created_by, note } = payload;

    if (amount <= 0) throw new BadRequestException('Credit amount must be greater than zero');

    const wallet = await this.wallet.findOneOrCreate(
      { user_id },
      { user_id, balance: 0, total_credit: 0, total_debit: 0 },
    );

    const before = wallet.balance;
    const newBalance = wallet.balance + amount;

    await wallet.updateOne({
      balance: newBalance,
      total_credit: wallet.total_credit + amount,
    });

    const transactionId = await this.shared.generateSequentialId('wallet_transaction_id', 'WT', 8);

    await this.transaction.create({
      user_id,
      transaction_id: transactionId,
      type: WalletTransactionType.CREDIT,
      reason,
      amount,
      balance_before: before,
      balance_after: newBalance,
      merchant_id,
      payment_id,
      created_by,
      note,
    });

    return wallet;
  }

  private async debit(payload: ICreditDebitWallet): Promise<IWallet> {
    const { user_id, amount, reason, merchant_id, payment_id, created_by, note } = payload;

    if (amount <= 0) throw new BadRequestException('Debit amount must be greater than zero');

    const wallet = await this.wallet.findOneOrCreate(
      { user_id },
      { user_id, balance: 0, total_credit: 0, total_debit: 0 },
    );

    if (wallet.balance < amount) {
      throw new BadRequestException(`Insufficient balance. Available: ${wallet.balance}, Required: ${amount}`);
    }

    const before = wallet.balance;
    const newBalance = wallet.balance - amount;

    await wallet.updateOne({
      balance: newBalance,
      total_debit: wallet.total_debit + amount,
    });

    const transactionId = await this.shared.generateSequentialId('wallet_transaction_id', 'WT', 8);

    await this.transaction.create({
      user_id,
      transaction_id: transactionId,
      type: WalletTransactionType.DEBIT,
      reason,
      amount,
      balance_before: before,
      balance_after: newBalance,
      merchant_id,
      payment_id,
      created_by,
      note,
    });

    return wallet;
  }

  private async sendActivationSMS(merchant: Merchant): Promise<void> {
    const [password, hashedPassword] = await generatePassword();

    const user = await this.user.updateOne({ _id: merchant.user_id }, { password: hashedPassword });

    const message = `Your merchant account has been activated. Your login credentials are:\n\nPhone: ${user?.phone}\nPassword: ${password}\n\nPlease change your password after logging in.`;

    const to = normalizePhoneNumber(user?.phone || merchant.merchant_phone || '');

    await this.termii.sendSMS(to, message);
  }
}
