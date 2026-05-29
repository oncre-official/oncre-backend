import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { CREDIT_STATUS, ICredit } from '../types/credit.interface';

export type CreditDocument = HydratedDocument<Credit>;

@Schema({ collection: 'credits', versionKey: false, timestamps: true })
export class Credit extends Document implements ICredit {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId: ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  totalAmount: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  amountPaid: number;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  dueDate: Date;

  @ApiProperty()
  @Prop({ type: String, enum: CREDIT_STATUS, required: true, default: CREDIT_STATUS.ACTIVE })
  status: CREDIT_STATUS;

  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  enableCharges: boolean;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);

CreditSchema.virtual('repayments', {
  ref: 'Repayment',
  localField: '_id',
  foreignField: 'creditId',
});

CreditSchema.virtual('customer', {
  ref: 'Customer',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

CreditSchema.set('toObject', { virtuals: true });
CreditSchema.set('toJSON', { virtuals: true });
