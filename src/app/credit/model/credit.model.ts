import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { EscalationTier, MessageType, PaymentStatus } from '@on/enum';

import { ICredit } from '../types/credit.interface';

export type CreditDocument = HydratedDocument<Credit>;

@Schema({ collection: 'credits', versionKey: false, timestamps: true })
export class Credit extends Document implements ICredit {
  @ApiProperty({ description: 'Unique identifier for the credit', example: 'CRD-00001' })
  @Prop({ required: true, unique: true })
  credit_id: string;

  @ApiProperty({ description: 'Merchant ID associated with the credit', example: 'MER-00001' })
  @Prop({ required: true })
  merchant_id: string;

  @ApiProperty({ description: 'Customer key', example: 'CUST-00001' })
  @Prop({ required: true })
  customer_key: string;

  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  @Prop({ required: true })
  customer_name: string;

  @ApiProperty({ description: 'Customer phone number', example: '+1234567890' })
  @Prop({ required: true })
  customer_phone: string;

  @ApiProperty({ description: 'Credit amount', example: 1000 })
  @Prop({ required: true })
  credit_amount: number;

  @ApiProperty({ description: 'Date when the credit was issued', example: '2024-01-01T00:00:00Z' })
  @Prop({ required: false })
  credit_date: Date;

  @ApiProperty({ description: 'Due date for the credit', example: '2024-02-01T00:00:00Z' })
  @Prop({ required: false })
  due_date: Date;

  @ApiProperty({ description: 'Location associated with the credit', example: '123 Main St, City, Country' })
  @Prop({ required: false })
  location: string;

  // System-calculated — NEVER from Excel
  @ApiProperty({ description: 'Payment status of the credit', example: PaymentStatus.UNPAID })
  @Prop({ required: false, enum: PaymentStatus })
  payment_status: PaymentStatus;

  @ApiProperty({ description: 'Total amount paid towards the credit', example: 500 })
  @Prop({ required: false })
  total_paid: number;

  @ApiProperty({ description: 'Due date for the credit', example: '2024-02-01T00:00:00Z' })
  @Prop({ required: false })
  escalation_eligible: boolean;

  // Messaging state
  @ApiProperty({ description: 'Indicates if free re-engagement is active', example: false })
  @Prop({ required: false })
  free_reengagement_active: boolean;

  @ApiProperty({ description: 'Indicates if free re-engagement has been used', example: false })
  @Prop({ required: false })
  free_reengagement_used: boolean;

  @ApiProperty({
    description: 'Date when free re-engagement started',
    example: '2024-01-15T00:00:00Z',
    nullable: false,
  })
  @Prop({ required: false })
  free_reengagement_started_at: Date | null;

  @ApiProperty({ description: 'Indicates if paid part re-engagement is active', example: false })
  @Prop({ required: false })
  paid_part_reengagement_active: boolean;

  @ApiProperty({
    description: 'New due date after paid part re-engagement',
    example: '2024-03-01T00:00:00Z',
    nullable: false,
  })
  new_due_date: Date | null;

  // Escalation state
  @ApiProperty({ description: 'Current escalation tier', example: EscalationTier.TIER_1, nullable: false })
  @Prop({ required: false, enum: EscalationTier })
  escalation_tier: EscalationTier | null;

  @ApiProperty({ description: 'Indicates if escalation has been approved', example: false })
  @Prop({ required: false })
  escalation_approved: boolean;

  @ApiProperty({
    description: 'Date when escalation started',
    example: '2024-01-20T00:00:00Z',
    nullable: false,
  })
  escalation_start_date: Date | null;

  // Old debt tracking
  @ApiProperty({ description: 'Indicates if the credit is an old debt', example: false })
  @Prop({ required: false })
  is_old_debt: boolean;

  @ApiProperty({ description: 'Date when the credit was introduced', example: '2024-01-01T00:00:00Z' })
  @Prop({ required: false })
  introduced_at: Date;

  // Meta
  @ApiProperty({
    description: 'Active message path for the credit',
    example: MessageType.FREE_REENGAGEMENT,
    nullable: false,
  })
  @Prop({ required: false, enum: MessageType })
  active_message_path: MessageType | null;

  @ApiProperty({ description: 'Indicates if messaging has been stopped', example: false })
  @Prop({ required: false })
  messaging_stopped: boolean;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);

CreditSchema.virtual('merchant', {
  ref: 'Merchant',
  localField: 'merchant_id',
  foreignField: 'merchant_id',
  justOne: true,
});

CreditSchema.virtual('customer', {
  ref: 'Customer',
  localField: 'customer_key',
  foreignField: 'customer_key',
  justOne: true,
});

CreditSchema.set('toObject', { virtuals: true });
CreditSchema.set('toJSON', { virtuals: true });
