import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { ServiceResponse } from '@on/utils/types';

import { MerchantRepository } from '../merchant/repository/merchant.repository';
import { Payment } from '../payment/model/payment.model';
import { PaymentRepository } from '../payment/repository/payment.repository';
import { MerchantPaymentStatus, PaymentType } from '../payment/types/payment.interface';
import { SharedService } from '../shared/shared.service';
import { User } from '../user/model/user.model';
import { UserRepository } from '../user/repository/user.repository';

import { ActivationPaymentDto, ActivationStatus, ConfirmActivationPaymentDto } from './dto/activation.dto';
import { CommissionPayoutDto } from './dto/payout.dto';
import { CommissionPayout } from './model/commission-payout.model';
import { CommissionPayoutRepository } from './repository/commission-payout.repository';
import { WalletTransactionRepository } from './repository/wallet-transaction.repository';
import { WalletRepository } from './repository/wallet.repository';
import { CommissionPayoutStatus } from './types/commission.interface';
import { ICreditDebitWallet, IWallet, WalletTransactionType } from './types/wallet.interface';

@Injectable()
export class AgentService {
  constructor(
    private readonly user: UserRepository,
    private readonly shared: SharedService,
    private readonly wallet: WalletRepository,
    private readonly payment: PaymentRepository,
    private readonly merchant: MerchantRepository,
    private readonly payout: CommissionPayoutRepository,
    private readonly transaction: WalletTransactionRepository,
  ) {}

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
            status: MerchantPaymentStatus.REJECTED,
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
          status: MerchantPaymentStatus.CONFIRMED,
          confirmed_by: admin._id,
          confirmed_at: new Date(),
        });

        await this.credit({
          user_id: agent._id,
          amount: commission,
          reason: 'Merchant activation',
          merchant_id: merchant.merchant_id,
          payment_id,
          created_by: admin._id,
          note: `Commission for merchant ${merchant.merchant_name}`,
        });

        await merchant.updateOne({ activated: true });

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
      reason: 'Commission payout',
      created_by: admin._id,
      note: `Commission for payout ${payoutId}`,
    });

    return { data: payout, message: 'Commission payout logged successfully.' };
  }

  /**
   * PRIVATE METHODS
   */

  async credit(payload: ICreditDebitWallet): Promise<IWallet> {
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

  async debit(payload: ICreditDebitWallet): Promise<IWallet> {
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
}
