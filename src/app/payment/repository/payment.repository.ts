import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Payment, PaymentDocument } from '../model/payment.model';

export class PaymentRepository extends BaseRepository<PaymentDocument> {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>) {
    super(paymentModel);
  }
}
