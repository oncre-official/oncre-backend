import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { PaymentPlan, PaymentPlanDocument } from '../model/payment-plan.model';

export class PaymentPlanRepository extends BaseRepository<PaymentPlanDocument> {
  constructor(@InjectModel(PaymentPlan.name) private paymentPlanModel: Model<PaymentPlanDocument>) {
    super(paymentPlanModel);
  }
}
