import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument } from 'mongoose';

import { IPaymentAudit, MerchantPaymentStatus, PaymentAuditAction, PaymentType } from '../types/payment.interface';

export type PaymentAuditDocument = HydratedDocument<PaymentAudit>;

@Schema({
  collection: 'payment_audits',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class PaymentAudit extends Document implements IPaymentAudit {
  @ApiProperty()
  @Prop({ type: String })
  payment_id: string;

  @ApiProperty()
  @Prop({ type: String })
  merchant_id: string;

  @ApiProperty({ required: false })
  @Prop({ enum: PaymentType, required: false })
  type: PaymentType;

  @ApiProperty({ required: false })
  @Prop({ type: ObjectId, required: false })
  admin_id: ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: ObjectId, required: false })
  user_id: ObjectId;

  @ApiProperty({ required: false })
  @Prop({ enum: PaymentAuditAction, required: false })
  action: PaymentAuditAction;

  @ApiProperty({ required: false })
  @Prop({ enum: MerchantPaymentStatus, required: false })
  previous_status: MerchantPaymentStatus;

  @ApiProperty({ required: false })
  @Prop({ enum: MerchantPaymentStatus, required: false })
  new_status: MerchantPaymentStatus;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  reason: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  note: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object, required: false })
  meta: Record<string, any>;
}

export const PaymentAuditSchema = SchemaFactory.createForClass(PaymentAudit);

PaymentAuditSchema.set('toObject', { virtuals: true });
PaymentAuditSchema.set('toJSON', { virtuals: true });
