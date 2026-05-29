import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { IRepayment } from '../types/repayment.interface';

export type RepaymentDocument = HydratedDocument<Repayment>;

@Schema({ collection: 'repayments', versionKey: false, timestamps: true })
export class Repayment extends Document implements IRepayment {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Credit' })
  creditId: ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  amount: number;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  date: Date;
}

export const RepaymentSchema = SchemaFactory.createForClass(Repayment);

RepaymentSchema.virtual('credit', {
  ref: 'Credit',
  localField: 'creditId',
  foreignField: '_id',
  justOne: true,
});

RepaymentSchema.set('toObject', { virtuals: true });
RepaymentSchema.set('toJSON', { virtuals: true });
