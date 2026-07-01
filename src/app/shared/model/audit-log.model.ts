import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { IAuditLog } from '../type/audit-log.interface';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({
  collection: 'audit_logs',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class AuditLog extends Document implements IAuditLog {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  action: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  route: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  method: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  reason: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  ip_address: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  user_agent: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
