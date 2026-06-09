import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { CustomerStatus, ICustomer } from '../types/customer.interface';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({
  collection: 'customers',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Customer extends Document implements ICustomer {
  @ApiProperty({ description: 'User ID associated with the customer', type: String, required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user_id?: ObjectId;

  @ApiProperty({ description: 'User who created the customer', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  created_by?: ObjectId;

  @ApiProperty({ description: 'Unique identifier for the customer', example: 'CUS-00001' })
  @Prop({ required: false, unique: true })
  customer_id: string;

  @ApiProperty({ description: 'Unique identifier for the customer', example: 'MER-00001' })
  @Prop({ required: true, unique: true })
  customer_key: string;

  @ApiProperty({ description: 'Personal name of the customer', example: 'John Doe' })
  @Prop({ required: true })
  customer_name: string;

  @ApiProperty()
  @Prop({ enum: CustomerStatus, required: true, default: CustomerStatus.ACTIVE })
  status: CustomerStatus;

  @ApiProperty({ description: 'Business name of the customer', example: 'Ola Ventures' })
  @Prop({ required: false })
  business_name: string;

  @ApiProperty({ description: 'Phone number of the customer', example: '+1234567890' })
  @Prop({ required: true })
  customer_phone: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

CustomerSchema.set('toObject', { virtuals: true });
CustomerSchema.set('toJSON', { virtuals: true });
