import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Document, HydratedDocument, Types } from 'mongoose';

import { USER_STATUS } from '@on/enum';

import { IUser } from '../types/user.interface';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User extends Document implements IUser {
  @ApiProperty()
  @Prop({ type: String, required: true })
  countryCode: string;

  @ApiProperty()
  @Prop({ type: String, required: true, unique: true })
  phone: string;

  @ApiProperty()
  @Prop({ type: String, required: false, unique: true, sparse: true })
  email: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  password: string;

  @ApiProperty()
  @Prop({ type: String, required: false })
  pin: string;

  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  phoneVerified: boolean;

  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  emailVerified: boolean;

  @ApiProperty()
  @Prop({ enum: USER_STATUS, required: true, default: USER_STATUS.INACTIVE })
  status: USER_STATUS;

  @ApiProperty()
  @Prop({ type: Date })
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ countryCode: 1, phone: 1 }, { unique: true });

UserSchema.index({ email: 1 });
UserSchema.index({ countryCode: 1, phone: 1 });

UserSchema.virtual('phoneNumber').get(function () {
  return `${this.countryCode}${this.phone}`;
});

UserSchema.virtual('role', {
  ref: 'Role',
  localField: 'roleId',
  foreignField: '_id',
  justOne: true,
});
