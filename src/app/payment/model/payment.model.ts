import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { CasePaymentStatus } from '@on/enum';

import { IPayment } from '../types/payment.interface';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({
  collection: 'payments',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Payment extends Document implements IPayment {
  @ApiProperty()
  @Prop({ type: String })
  payment_id: string;

  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true })
  case_id: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  amount: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  amount_paid: number;

  @ApiProperty({ required: false })
  @Prop({ enum: CasePaymentStatus, required: false })
  status: CasePaymentStatus;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  reference: string;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  provider?: string;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  payment_url: string;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  paid_at: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.set('toObject', { virtuals: true });
PaymentSchema.set('toJSON', { virtuals: true });
