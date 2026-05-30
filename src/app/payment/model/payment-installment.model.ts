import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { InstallmentPaymentStatus, IPaymentInstallment } from '../types/payment-plan.interface';

export type PaymentInstallmentDocument = HydratedDocument<PaymentInstallment>;

@Schema({
  collection: 'payment_plans',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class PaymentInstallment extends Document implements IPaymentInstallment {
  @ApiProperty()
  @Prop({ type: String })
  installment_id: string;

  @ApiProperty()
  @Prop({ type: String })
  plan_id: string;

  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true, unique: true })
  case_id: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  amount: number;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  due_date: Date;

  @ApiProperty({ required: false })
  @Prop({ enum: InstallmentPaymentStatus, required: false })
  status: InstallmentPaymentStatus;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  payment_url: string;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  reference: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  amount_paid: number;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  paid_at: Date ;
}

export const PaymentInstallmentSchema = SchemaFactory.createForClass(PaymentInstallment);

PaymentInstallmentSchema.set('toObject', { virtuals: true });
PaymentInstallmentSchema.set('toJSON', { virtuals: true });
