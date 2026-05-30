import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument } from 'mongoose';

import { ActionType, EscalationTier, MessageDeliveryStatus, MessageType } from '@on/enum';

import { IMessage } from '../types/message.interface';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ collection: 'messages', versionKey: false,   timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }, })
export class Message extends Document implements IMessage {
  @ApiProperty({ description: 'Unique identifier for the case', example: 'CA-00001' })
  @Prop({ required: false })
  case_id?: string;

  @ApiProperty({ description: 'Unique identifier for the credit', example: 'CRD-00001' })
  @Prop({ required: false })
  credit_id: string;

  @ApiProperty({ description: 'Merchant ID associated with the credit', example: 'MER-00001' })
  @Prop({ required: true })
  merchant_id: string;

  @ApiProperty({ description: 'Unique identifier for the customer', example: 'MER-00001' })
  @Prop({ required: false })
  customer_key: string;

  @ApiProperty({ description: 'Phone number of the customer', example: '+1234567890' })
  @Prop({ required: false })
  customer_phone: string;

  @ApiProperty({ description: 'Phone number of the customer', example: '+1234567890' })
  @Prop({ required: false })
  debtor_phone?: string;

  @ApiProperty()
  @Prop({ Type: Number, required: false })
  day?: number;

  @ApiProperty({ example: MessageType.CASE_ACTIVATION })
  @Prop({ required: false, enum: MessageType })
  message_type: MessageType;

  @ApiProperty({ example: EscalationTier.TIER_1 })
  @Prop({ required: false, enum: EscalationTier })
  message_tier: EscalationTier | null;

  @ApiProperty()
  @Prop({ Type: Number, required: false })
  message_index: number;

  @ApiProperty({ example: ActionType.CALL })
  @Prop({ required: false, enum: ActionType })
  action_type: ActionType;

  @ApiProperty()
  @Prop({ Type: String, required: false })
  message_body: string;

  @ApiProperty()
  @Prop({ Type: Date, required: false })
  scheduled_for: Date;

  @ApiProperty()
  @Prop({ Type: Date, required: false })
  sent_at: Date | null;

  @ApiProperty({ example: MessageDeliveryStatus.SCHEDULED })
  @Prop({ required: false, enum: MessageDeliveryStatus })
  delivery_status: MessageDeliveryStatus;

  @ApiProperty()
  @Prop({ required: false, Type: String })
  termii_message_id: string | null;

  @ApiProperty()
  @Prop({ required: false, Type: String })
  error_details: string | null;

  @ApiProperty()
  @Prop({ required: false, Type: String })
  cancelled_reason: string | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.set('toObject', { virtuals: true });
MessageSchema.set('toJSON', { virtuals: true });
