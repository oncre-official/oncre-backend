import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { CommissionPayoutMethod, CommissionPayoutStatus, ICommissionPayout } from '../types/commission.interface';

export type CommissionPayoutDocument = HydratedDocument<CommissionPayout>;

@Schema({
  collection: 'commission_payouts',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class CommissionPayout extends Document implements ICommissionPayout {
  @ApiProperty({ description: 'User ID associated with the merchant', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user_id: ObjectId;

  @ApiProperty()
  @Prop({ type: String })
  payout_id: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  amount: number;

  @ApiProperty({ required: false })
  @Prop({ enum: CommissionPayoutStatus, required: false })
  status: CommissionPayoutStatus;

  @ApiProperty({ required: false })
  @Prop({ enum: CommissionPayoutMethod, required: false })
  method: CommissionPayoutMethod;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  reference: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  note: string;

  @ApiProperty({ description: 'User who created the merchant', required: false })
  @Prop({ type: ObjectId, ref: 'User', required: false })
  paid_by: ObjectId;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  paid_at: Date;
}

export const CommissionPayoutSchema = SchemaFactory.createForClass(CommissionPayout);

CommissionPayoutSchema.set('toObject', { virtuals: true });
CommissionPayoutSchema.set('toJSON', { virtuals: true });
