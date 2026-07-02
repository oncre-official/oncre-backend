import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { PaymentAudit, PaymentAuditDocument } from '../model/payment-audit.model';

export class PaymentAuditRepository extends BaseRepository<PaymentAuditDocument> {
  constructor(@InjectModel(PaymentAudit.name) private paymentAuditModel: Model<PaymentAuditDocument>) {
    super(paymentAuditModel);
  }
}
