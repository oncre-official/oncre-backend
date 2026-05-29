import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';

import { Payment, PaymentSchema } from './model/payment.model';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './repository/payment.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]), UserModule],
  controllers: [PaymentController],
  providers: [PaymentRepository, PaymentService, PaymentRepository],
  exports: [PaymentRepository, PaymentService, PaymentRepository],
})
export class PaymentModule {}
