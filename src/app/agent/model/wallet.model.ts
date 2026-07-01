import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { IWallet } from '../types/wallet.interface';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({
  collection: 'wallets',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Wallet extends Document implements IWallet {
  @ApiProperty({ description: 'User ID associated with the merchant', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user_id: ObjectId;

  @ApiProperty({ description: 'Wallet balance', example: 1000 })
  @Prop({ required: true, type: Number, default: 0 })
  balance: number;

  @ApiProperty({ description: 'Total credit', example: 1000 })
  @Prop({ required: true, type: Number })
  total_credit: number;

  @ApiProperty({ description: 'Total debit', example: 1000 })
  @Prop({ required: true, type: Number })
  total_debit: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.set('toObject', { virtuals: true });
WalletSchema.set('toJSON', { virtuals: true });
