import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { CallOutcomeStatus, CallType } from '@on/enum';

import { ICall } from '../types/call.interface';

export type CallDocument = HydratedDocument<Call>;

@Schema({
  collection: 'credits',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Call extends Document implements ICall {
  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true, unique: true })
  call_id: string;

  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true, unique: true })
  credit_id?: string;

  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true, unique: true })
  case_id: string;

  @ApiProperty({ description: 'Merchant ID' })
  @Prop({ required: true })
  merchant_id: string;

  @ApiProperty({ description: 'Debtor Phone' })
  @Prop({ required: true })
  debtor_phone: string;

  @ApiProperty({ required: false })
  @Prop({ Type: Number, required: false })
  day?: number;

  @ApiProperty({ required: false })
  @Prop({ enum: CallType, required: false })
  call_type: CallType;

  @ApiProperty({ required: false })
  @Prop({ enum: CallOutcomeStatus, required: false })
  status: CallOutcomeStatus;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  scheduled_for: Date;
}

export const CallSchema = SchemaFactory.createForClass(Call);

CallSchema.set('toObject', { virtuals: true });
CallSchema.set('toJSON', { virtuals: true });
