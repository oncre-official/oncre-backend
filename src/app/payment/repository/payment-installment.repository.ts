import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { PaymentInstallment, PaymentInstallmentDocument } from '../model/payment-installment.model';

export class PaymentInstallmentRepository extends BaseRepository<PaymentInstallmentDocument> {
  constructor(
    @InjectModel(PaymentInstallment.name) private paymentInstallmentModel: Model<PaymentInstallmentDocument>,
  ) {
    super(paymentInstallmentModel);
  }
}
