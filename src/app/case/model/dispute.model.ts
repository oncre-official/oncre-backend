import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { DisputeStatus, IDispute } from '../types/dispute.interface';

import { Case } from './case.model';

export type DisputeDocument = HydratedDocument<Dispute>;

@Schema({
  collection: 'disputes',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Dispute extends Document implements IDispute {
  @ApiProperty({ description: 'Auto-generated: CL-00001' })
  @Prop({ required: true })
  call_id: string;

  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true })
  case_id: string;

  @ApiProperty({ description: 'The call log', required: false })
  @Prop({ type: Types.ObjectId, ref: 'CallLog', required: false })
  call_log_id: ObjectId;

  @ApiProperty({ description: 'Note' })
  @Prop({ required: false })
  note: string;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  resolved_at: Date;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  escalated_at: Date;

  @ApiProperty({ required: false })
  @Prop({ enum: DisputeStatus, required: true, default: DisputeStatus.OPEN })
  status: DisputeStatus;

  @ApiProperty({ description: 'User who resolved the dispute', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  resolved_by: ObjectId;

  @ApiProperty({ description: 'User who escalated the dispute', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  escalated_by: ObjectId;

  /**
   * ATTRIBUTES
   */
  @ApiHideProperty()
  case: Case;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);

DisputeSchema.virtual('case', {
  ref: 'Case',
  localField: 'case_id',
  foreignField: 'case_id',
  justOne: true,
});

DisputeSchema.set('toObject', { virtuals: true });
DisputeSchema.set('toJSON', { virtuals: true });
