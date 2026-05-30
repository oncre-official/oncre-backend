import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { IPaymentPlan, PaymentFrequency, PaymentPlanStatus } from '../types/payment-plan.interface';

export type PaymentPlanDocument = HydratedDocument<PaymentPlan>;

@Schema({
  collection: 'payment_plans',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class PaymentPlan extends Document implements IPaymentPlan {
  @ApiProperty()
  @Prop({ type: String })
  plan_id: string;

  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true, unique: true })
  case_id: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  total_amount: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  total_paid: number;

  @ApiProperty({ required: false })
  @Prop({ enum: PaymentFrequency, required: false })
  frequency: PaymentFrequency;

  @ApiProperty({ required: false })
  @Prop({ enum: PaymentPlanStatus, required: false })
  status: PaymentPlanStatus;

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
  paid_at: Date ;
}

export const PaymentPlanSchema = SchemaFactory.createForClass(PaymentPlan);

PaymentPlanSchema.set('toObject', { virtuals: true });
PaymentPlanSchema.set('toJSON', { virtuals: true });
