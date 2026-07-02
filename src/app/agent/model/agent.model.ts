import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { IAgent } from '../types/agent.interface';

export type AgentDocument = HydratedDocument<Agent>;

@Schema({
  collection: 'agents',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Agent extends Document implements IAgent {
  @ApiProperty({ description: 'User ID associated with the agent', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user_id?: ObjectId;

  @ApiProperty({ description: 'User who created the agent', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  created_by?: ObjectId;

  @ApiProperty({ description: 'First name of the agent', example: 'John' })
  @Prop({ required: true })
  first_name: string;

  @ApiProperty({ description: 'Last name of the agent', example: 'Doe' })
  @Prop({ required: false })
  last_name: string;

  @ApiProperty({ description: 'Email of the agent' })
  @Prop({ required: false })
  email: string;

  @ApiProperty({ description: 'Phone number of the agent', example: '+1234567890' })
  @Prop({ required: true })
  phone: string;

  @ApiProperty({ description: 'Location of the agent', example: '123 Main St, City, Country' })
  @Prop({ required: false })
  zone: string;

  @ApiProperty({ description: 'Indicates whether the agent is activated', example: true })
  @Prop({ required: true, default: false })
  status: string;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

AgentSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

AgentSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true,
});

AgentSchema.set('toObject', { virtuals: true });
AgentSchema.set('toJSON', { virtuals: true });
