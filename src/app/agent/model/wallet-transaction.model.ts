import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { IWalletTransaction, WalletTransactionReason, WalletTransactionType } from '../types/wallet.interface';

export type WalletTransactionDocument = HydratedDocument<WalletTransaction>;

@Schema({
  collection: 'wallet_transactions',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class WalletTransaction extends Document implements IWalletTransaction {
  @ApiProperty({ description: 'User ID associated with the merchant', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user_id: ObjectId;

  @ApiProperty()
  @Prop({ type: String })
  merchant_id: string;

  @ApiProperty()
  @Prop({ type: String })
  transaction_id: string;

  @ApiProperty({ required: false })
  @Prop({ enum: WalletTransactionType, required: false })
  type: WalletTransactionType;

  @ApiProperty({ required: false })
  @Prop({ enum: WalletTransactionReason, required: false })
  reason: WalletTransactionReason;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  amount: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  balance_before: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  balance_after: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  payment_id: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  payout_id: string;

  @ApiProperty({ description: 'User who created the merchant', required: false })
  @Prop({ type: ObjectId, ref: 'User', required: false })
  created_by: ObjectId;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  note: string;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);

WalletTransactionSchema.set('toObject', { virtuals: true });
WalletTransactionSchema.set('toJSON', { virtuals: true });
