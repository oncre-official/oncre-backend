import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { Role } from '@on/app/role/model/role.model';
import { UserStatus } from '@on/enum';

import { IUser } from '../types/user.interface';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User extends Document implements IUser {
  @ApiProperty()
  @Prop({ type: String, required: true, default: '234' })
  country_code: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  phone: string;

  @ApiProperty()
  @Prop({ type: String, required: false, unique: true, sparse: true })
  email: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role_id: ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  password: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  pin: string;

  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  phone_verified: boolean;

  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  email_verified: boolean;

  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  password_changed: boolean;

  @ApiProperty()
  @Prop({ enum: UserStatus, required: true, default: UserStatus.INACTIVE })
  status: UserStatus;

  @ApiProperty()
  @Prop({ type: Date })
  last_login: Date;

  /**
   * UTILITY
   */
  @ApiHideProperty()
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ country_code: 1, phone: 1 }, { unique: true });

UserSchema.virtual('phoneNumber').get(function () {
  return `${this.country_code}${this.phone}`;
});

UserSchema.virtual('role', {
  ref: 'Role',
  localField: 'role_id',
  foreignField: '_id',
  justOne: true,
});
