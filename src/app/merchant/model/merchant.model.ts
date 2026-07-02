import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { IMerchant } from '../types/merchant.interface';

export type MerchantDocument = HydratedDocument<Merchant>;

@Schema({
  collection: 'merchants',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Merchant extends Document implements IMerchant {
  @ApiProperty({ description: 'User ID associated with the merchant', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user_id?: ObjectId;

  @ApiProperty({ description: 'User who created the merchant', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  created_by?: ObjectId;

  @ApiProperty({ description: 'Unique identifier for the merchant', example: 'MER-00001' })
  @Prop({ required: true, unique: true })
  merchant_id: string;

  @ApiProperty({ description: 'Personal name of the merchant', example: 'John Doe' })
  @Prop({ required: true })
  merchant_name: string;

  @ApiProperty({ description: 'Store name of the merchant', example: "John's Store" })
  @Prop({ required: false })
  merchant_store_name: string;

  @ApiProperty({ description: 'Phone number of the merchant', example: '+1234567890' })
  @Prop({ required: true })
  merchant_phone: string;

  @ApiProperty({ description: 'Location of the merchant', example: '123 Main St, City, Country' })
  @Prop({ required: false })
  location: string;

  @ApiProperty({ description: 'Channel through which the merchant was acquired', example: 'Admin' })
  @Prop({ required: false })
  channel: string;

  @ApiProperty({ description: 'Indicates whether the merchant is activated', example: true })
  @Prop({ required: true, default: false })
  activated: boolean;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);

MerchantSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

MerchantSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_id',
  foreignField: '_id',
  justOne: true,
});

MerchantSchema.set('toObject', { virtuals: true });
MerchantSchema.set('toJSON', { virtuals: true });
