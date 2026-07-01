import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument } from 'mongoose';

import { PaymentStatus } from '@on/enum';

import { IPayment, MerchantPaymentStatus, PaymentType } from '../types/payment.interface';

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

  @ApiProperty()
  @Prop({ type: String })
  merchant_id: string;

  @ApiProperty({ description: 'Case id' })
  @Prop({ required: false })
  case_id: string;

  @ApiProperty({ required: false })
  @Prop({ enum: PaymentType, required: false })
  type: PaymentType;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  amount: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  amount_paid: number;

  @ApiProperty({ required: false })
  @Prop({ enum: PaymentStatus, required: false })
  status: PaymentStatus;

  @ApiProperty({ required: false })
  @Prop({ enum: MerchantPaymentStatus, required: false })
  merchant_status: MerchantPaymentStatus;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  receipt_url: string;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  reference: string;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  provider: string;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  payment_url: string;

  @ApiProperty({ description: 'User who created the merchant', required: false })
  @Prop({ type: ObjectId, ref: 'User', required: false })
  uploaded_by: ObjectId;

  @ApiProperty({ description: 'User who created the merchant', required: false })
  @Prop({ type: ObjectId, ref: 'User', required: false })
  confirmed_by: ObjectId;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  rejection_reason: string;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  confirmed_at: Date;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  paid_at: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.set('toObject', { virtuals: true });
PaymentSchema.set('toJSON', { virtuals: true });
