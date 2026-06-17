import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { Case } from '@on/app/case/model/case.model';
import { CallOutcomeStatus, CallType } from '@on/enum';

import { ICall } from '../types/call.interface';

export type CallDocument = HydratedDocument<Call>;

@Schema({
  collection: 'calls',
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

  @ApiProperty({ description: 'Auto-generated: CR-00001' })
  @Prop({ required: false })
  credit_id?: string;

  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: false })
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

  /**
   * ATTRIBUTES
   */
  @ApiHideProperty()
  case: Case;
}

export const CallSchema = SchemaFactory.createForClass(Call);

CallSchema.virtual('case', {
  ref: 'Case',
  localField: 'case_id',
  foreignField: 'case_id',
  justOne: true,
});

CallSchema.set('toObject', { virtuals: true });
CallSchema.set('toJSON', { virtuals: true });
