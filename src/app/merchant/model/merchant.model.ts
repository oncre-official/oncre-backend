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
  @ApiProperty({ description: 'User ID associated with the merchant', type: String, required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user_id?: ObjectId;

  @ApiProperty({ description: 'Unique identifier for the merchant', example: 'MER-00001' })
  @Prop({ required: true, unique: true })
  merchant_id: string;

  @ApiProperty({ description: 'Personal name of the merchant', example: 'John Doe' })
  @Prop({ required: true })
  merchant_name: string;

  @ApiProperty({ description: 'Store name of the merchant', example: "John's Store" })
  @Prop({ required: true })
  merchant_store_name: string;

  @ApiProperty({ description: 'Phone number of the merchant', example: '+1234567890' })
  @Prop({ required: true })
  merchant_phone: string;

  @ApiProperty({ description: 'Location of the merchant', example: '123 Main St, City, Country' })
  @Prop({ required: true })
  location: string;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);

MerchantSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

MerchantSchema.set('toObject', { virtuals: true });
MerchantSchema.set('toJSON', { virtuals: true });
