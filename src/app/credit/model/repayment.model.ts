import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { EscalationTier, EventType, PaymentStatus } from '@on/enum';

import { IRepayment } from '../types/repayment.interface';

export type RepaymentDocument = HydratedDocument<Repayment>;

@Schema({
  collection: 'repayments',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Repayment extends Document implements IRepayment {
  @ApiProperty({ description: 'Unique identifier for the credit', example: 'CRD-00001' })
  @Prop({ required: true })
  credit_id: string;

  @ApiProperty({ description: 'Merchant ID associated with the credit', example: 'MER-00001' })
  @Prop({ required: true })
  merchant_id: string;

  @ApiProperty({ description: 'Repayment amount', example: 1000 })
  @Prop({ required: true })
  payment_amount: number;

  @ApiProperty({ description: 'Date when the payment was made', example: '2024-01-01T00:00:00Z' })
  @Prop({ required: false })
  payment_date: Date;

  @ApiProperty({ description: 'Payment type', example: '123 Main St, City, Country' })
  @Prop({ required: false })
  payment_type: string;

  @ApiProperty({ description: 'Event type', example: PaymentStatus.UNPAID })
  @Prop({ required: false, enum: EventType })
  event_type: EventType;

  @ApiProperty({ description: 'Paid part reengagement', example: '2024-02-01T00:00:00Z' })
  @Prop({ required: false })
  paid_part_reengagement: boolean;

  @ApiProperty({
    description: 'New due date after paid part re-engagement',
    example: '2024-03-01T00:00:00Z',
    nullable: false,
  })
  new_due_date: Date;

  @ApiProperty({ description: 'Current escalation tier', example: EscalationTier.TIER_1, nullable: false })
  @Prop({ required: false, enum: EscalationTier })
  escalation_tier: EscalationTier;

  @ApiProperty({ description: 'Indicates if escalation has been approved', example: false })
  @Prop({ required: false })
  merchant_approval: boolean;

  @ApiProperty({
    description: 'Date when escalation started',
    example: '2024-01-20T00:00:00Z',
    nullable: false,
  })
  escalation_start_date: Date;
}

export const RepaymentSchema = SchemaFactory.createForClass(Repayment);

RepaymentSchema.set('toObject', { virtuals: true });
RepaymentSchema.set('toJSON', { virtuals: true });
