import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { IRemittance, RemittanceStatus } from '../types/remittance.interface';

export type RemittanceDocument = HydratedDocument<Remittance>;

@Schema({
  collection: 'remittances',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Remittance extends Document implements IRemittance {
  @ApiProperty()
  @Prop({ type: String })
  remittance_id: string;

  @ApiProperty()
  @Prop({ type: String })
  merchant_id: string;

  @ApiProperty()
  @Prop({ required: true })
  case_id: string;

  @ApiProperty()
  @Prop({ required: true })
  plan_id: string;

  @ApiProperty()
  @Prop({ required: true })
  installment_id: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  payment_id: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  gross_amount: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  commission_rate: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  commission_amount: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  net_amount: number;

  @ApiProperty({ required: false })
  @Prop({ enum: RemittanceStatus, required: false })
  status: RemittanceStatus;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  reference: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  provider: string;

  @ApiProperty({ required: false })
  @Prop({ Type: Date, required: false })
  remitted_at: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  failure_reason: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object, required: false })
  meta: Record<string, any>;
}

export const RemittanceSchema = SchemaFactory.createForClass(Remittance);

RemittanceSchema.set('toObject', { virtuals: true });
RemittanceSchema.set('toJSON', { virtuals: true });
