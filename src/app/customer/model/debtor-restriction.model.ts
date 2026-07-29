import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { DebtorRestrictionStatus, IDebtorRestriction } from '../types/debtor-restriction.interface';

export type DebtorRestrictionDocument = HydratedDocument<DebtorRestriction>;

@Schema({
  collection: 'debtor_restrictions',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class DebtorRestriction extends Document implements IDebtorRestriction {
  @ApiProperty({ description: 'Auto-generated: CUS-00001' })
  @Prop({ required: true })
  customer_id: string;

  @ApiProperty({ enum: DebtorRestrictionStatus })
  @Prop({ enum: DebtorRestrictionStatus, required: true })
  status: DebtorRestrictionStatus;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  reason?: string;

  @ApiProperty({ description: 'User who applied or cleared the restriction' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  actioned_by: ObjectId;

  @ApiProperty()
  @Prop({ Type: Date, required: true })
  actioned_at: Date;
}

export const DebtorRestrictionSchema = SchemaFactory.createForClass(DebtorRestriction);

DebtorRestrictionSchema.set('toObject', { virtuals: true });
DebtorRestrictionSchema.set('toJSON', { virtuals: true });
