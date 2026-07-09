import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { FiLeadStatus, IFiLead, NplVolumeBracket } from '../types/fi-lead.interface';

export type FiLeadDocument = HydratedDocument<FiLead>;

@Schema({
  collection: 'fi_leads',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class FiLead extends Document implements IFiLead {
  @ApiProperty()
  @Prop({ type: String, required: true })
  full_name: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  institution_name: string;

  @ApiProperty({ enum: NplVolumeBracket })
  @Prop({ enum: NplVolumeBracket, required: true })
  npl_volume_bracket: NplVolumeBracket;

  @ApiProperty()
  @Prop({ type: String, required: true })
  work_email: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  phone_number: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  utm_source?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  utm_medium?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  utm_campaign?: string;

  @ApiProperty({ enum: FiLeadStatus })
  @Prop({ enum: FiLeadStatus, default: FiLeadStatus.NEW })
  status: FiLeadStatus;

  @ApiProperty()
  @Prop({ type: Boolean, default: false })
  bot_suspected: boolean;
}

export const FiLeadSchema = SchemaFactory.createForClass(FiLead);
