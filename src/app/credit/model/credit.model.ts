import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { PaymentStatus } from '@on/enum';

import { ICredit } from '../types/credit.interface';

export type CreditDocument = HydratedDocument<Credit>;

@Schema({ collection: 'credits', versionKey: false, timestamps: true })
export class Credit extends Document implements ICredit {
  credit_id: string;
  merchant_id: string;
  customer_key: string;
  customer_name: string;
  customer_phone: string;
  credit_amount: number;
  credit_date: Date;
  due_date: Date;
  location: string;

  // System-calculated — NEVER from Excel
  payment_status: PaymentStatus;
  total_paid: number;
  escalation_eligible: boolean;

  // Messaging state
  free_reengagement_active: boolean;
  free_reengagement_used: boolean;
  free_reengagement_started_at: Date | null;
  paid_part_reengagement_active: boolean;
  new_due_date: Date | null;

  // Escalation state
  escalation_tier: EscalationTier | null;
  escalation_approved: boolean;
  escalation_start_date: Date | null;

  // Old debt tracking
  is_old_debt: boolean;
  introduced_at: Date;

  // Meta
  active_message_path: MessageType | null;
  messaging_stopped: boolean;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);

CreditSchema.set('toObject', { virtuals: true });
CreditSchema.set('toJSON', { virtuals: true });
