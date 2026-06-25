import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { ITransition, TransitionOutcome } from '../types/transition.interface';

import { Case } from './case.model';

export type TransitionDocument = HydratedDocument<Transition>;

@Schema({
  collection: 'transitions',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Transition extends Document implements ITransition {
  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true })
  case_id: string;

  @ApiProperty({ description: 'Note' })
  @Prop({ required: false })
  note: string;

  @ApiProperty({ required: false })
  @Prop({ enum: TransitionOutcome, required: true })
  outcome: TransitionOutcome;

  @ApiProperty({ description: 'User who escalated the transition', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  actioned_by: ObjectId;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  actioned_at: Date;

  /**
   * ATTRIBUTES
   */
  @ApiHideProperty()
  case: Case;
}

export const TransitionSchema = SchemaFactory.createForClass(Transition);

TransitionSchema.virtual('case', {
  ref: 'Case',
  localField: 'case_id',
  foreignField: 'case_id',
  justOne: true,
});

TransitionSchema.set('toObject', { virtuals: true });
TransitionSchema.set('toJSON', { virtuals: true });
