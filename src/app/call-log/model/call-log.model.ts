import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { ICallLog } from '../types/call-log.interface';

export type CallLogDocument = HydratedDocument<CallLog>;

@Schema({
  collection: 'call_logs',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class CallLog extends Document implements ICallLog {
  @ApiProperty({ description: 'Auto-generated: CL-00001' })
  @Prop({ required: true })
  call_id: string;

  @ApiProperty({ description: 'Auto-generated: CA-00001' })
  @Prop({ required: true })
  case_id: string;

  @ApiProperty({ description: 'Outcome' })
  @Prop({ required: true })
  outcome: string;

  @ApiProperty({ description: 'Note' })
  @Prop({ required: true })
  note?: string;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  called_at?: Date;
}

export const CallLogSchema = SchemaFactory.createForClass(CallLog);

CallLogSchema.set('toObject', { virtuals: true });
CallLogSchema.set('toJSON', { virtuals: true });
