import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, HydratedDocument, Types } from 'mongoose';

import { IRolePermission } from '../types/role.interface';

export type RolePermissionDocument = HydratedDocument<RolePermission>;

@Schema({
  collection: 'role_permissions',
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class RolePermission extends Document implements IRolePermission {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Role' })
  role_id: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Permission' })
  permission_id: string;
}

export const RolePermissionSchema = SchemaFactory.createForClass(RolePermission);

RolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { unique: true });
