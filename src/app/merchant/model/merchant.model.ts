import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { IMerchant, MerchantApprovalStatus } from '../types/merchant.interface';

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

  @ApiProperty({ description: 'Type of business the merchant runs', example: 'Retail', required: false })
  @Prop({ required: false })
  business_type?: string;

  @ApiProperty({ description: 'Location of the merchant', example: '123 Main St, City, Country' })
  @Prop({ required: false })
  location: string;

  @ApiProperty({ description: 'Bank name for merchant remittance', example: 'GTBank', required: false })
  @Prop({ required: false })
  bank_name?: string;

  @ApiProperty({ description: 'Bank account number for merchant remittance', example: '0123456789', required: false })
  @Prop({ required: false })
  bank_account_number?: string;

  @ApiProperty({ description: 'Bank account name for merchant remittance', example: 'John Doe', required: false })
  @Prop({ required: false })
  bank_account_name?: string;

  @ApiProperty({ description: 'Channel through which the merchant was acquired', example: 'Admin' })
  @Prop({ required: false })
  channel: string;

  @ApiProperty({ description: 'Indicates whether the merchant is activated', example: true })
  @Prop({ required: true, default: false })
  activated: boolean;

  @ApiProperty({ required: false, description: 'When the merchant was activated' })
  @Prop({ required: false })
  activated_at?: Date;

  @ApiProperty({
    description:
      'Whether the merchant profile is active (admin deactivation flag, independent of the onboarding-fee `activated` field)',
    example: true,
  })
  @Prop({ required: true, default: true })
  is_active: boolean;

  @ApiProperty({
    enum: MerchantApprovalStatus,
    description:
      'Admin approval gate for merchants created by sales/field-agent staff. Merchants created by admin/super-admin ' +
      'or via self-serve signup are exempt (default APPROVED). Independent of `activated` — a merchant only ' +
      'activates once BOTH approval_status is APPROVED AND payment is confirmed, whichever finishes second.',
  })
  @Prop({ enum: MerchantApprovalStatus, required: true, default: MerchantApprovalStatus.APPROVED })
  approval_status: MerchantApprovalStatus;
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
  localField: 'created_by',
  foreignField: '_id',
  justOne: true,
});

MerchantSchema.set('toObject', { virtuals: true });
MerchantSchema.set('toJSON', { virtuals: true });
