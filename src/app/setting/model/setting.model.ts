import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { ISetting, SettingCategory, SettingType } from '../types/setting.interface';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({
  collection: 'settings',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Setting extends Document implements ISetting {
  @ApiProperty({ description: 'Unique key for the setting', example: 'setting_key_123' })
  @Prop({ required: true, unique: true })
  key: string;

  @ApiProperty({ description: 'Value associated with the setting', example: 'Some value' })
  @Prop({ required: true })
  value: string;

  @ApiProperty({ description: 'Type of the setting', enum: SettingType, example: SettingType.STRING })
  @Prop({ required: true, enum: SettingType })
  type: SettingType;

  @ApiProperty({ description: 'Category of the setting', enum: SettingCategory, example: SettingCategory.PLATFORM })
  @Prop({ required: true, enum: SettingCategory })
  category: SettingCategory;

  @ApiProperty({ description: 'Configuration options for the setting', required: false })
  @Prop({ required: false, type: Object })
  config?: Record<string, any>;

  @ApiProperty({ description: 'Description of the setting', required: false })
  @Prop({ required: false })
  description?: string;

  @ApiProperty({ description: 'Indicates if the setting is active', required: true })
  @Prop({ required: true })
  is_active: boolean;

  @ApiProperty({ description: 'User who created the setting', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  created_by?: ObjectId;

  @ApiProperty({ description: 'User who last updated the setting', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updated_by?: ObjectId;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

SettingSchema.set('toObject', { virtuals: true });
SettingSchema.set('toJSON', { virtuals: true });
