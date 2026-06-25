import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { Merchant } from '@on/app/merchant/model/merchant.model';

import { CaseStatus, ICase, RecoveryMode } from '../types/case.interface';

import { Dispute } from './dispute.model';

export type CaseDocument = HydratedDocument<Case>;

@Schema({
  collection: 'cases',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Case extends Document implements ICase {
  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true, unique: true })
  case_id: string;

  @ApiProperty({ description: 'Merchant ID' })
  @Prop({ required: true })
  merchant_id: string;

  @ApiProperty({ description: 'Debtor Name' })
  @Prop({ required: true })
  debtor_name: string;

  @ApiProperty({ description: 'Debtor Phone' })
  @Prop({ required: true })
  debtor_phone: string;

  @ApiProperty({ description: 'Debtor Address', required: false })
  @Prop({ required: false })
  debtor_address?: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  wholesaler_name?: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  amount: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  due_date: Date;

  @ApiProperty({ required: false })
  @Prop({ enum: CaseStatus, required: false })
  status: CaseStatus;

  @ApiProperty({ required: false })
  @Prop({ Type: Number, required: false })
  escalation_level: number;

  @ApiProperty({ required: false })
  @Prop({ Type: Number, required: false })
  current_day: number;

  @ApiProperty({ required: false })
  @Prop({ Type: Boolean, required: false })
  is_paused: boolean;

  @ApiProperty({ required: false })
  @Prop({ Type: Boolean, required: false })
  hold?: boolean;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  hold_until?: Date;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  pause_reason?: string;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  paused_at?: Date;

  @ApiProperty({ required: false })
  @Prop({ Type: Number, required: false })
  paused_at_day?: number;

  @ApiProperty({ required: false })
  @Prop({ Type: Number, required: false })
  paused_at_level?: number;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  activated_at: Date;

  @ApiProperty({ required: false })
  @Prop({ enum: RecoveryMode, required: false })
  recovery_mode?: RecoveryMode;

  @ApiProperty({ required: false })
  @Prop({ Type: String, required: false })
  payment_plan_id?: string;

  @ApiProperty({ required: false })
  @Prop({ Type: Number, required: false })
  outstanding_balance?: number;

  @ApiProperty({ required: false })
  @Prop({ Type: Boolean, required: false })
  transition_required?: boolean;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  transition_due_at?: Date;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  transition_completed_at?: Date;

  /**
   * ATTRIBUTES
   */
  @ApiHideProperty()
  merchant: Merchant;

  @ApiHideProperty()
  dispute: Dispute;
}

export const CaseSchema = SchemaFactory.createForClass(Case);

CaseSchema.virtual('merchant', {
  ref: 'Merchant',
  localField: 'merchant_id',
  foreignField: 'merchant_id',
  justOne: true,
});

CaseSchema.virtual('dispute', {
  ref: 'Dispute',
  localField: 'case_id',
  foreignField: 'case_id',
  justOne: true,
});

CaseSchema.set('toObject', { virtuals: true });
CaseSchema.set('toJSON', { virtuals: true });
