import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { generatePassword } from '@on/helpers/password';
import { buildUserLookupQueryFromPayload } from '@on/helpers/user';
import { ServiceResponse } from '@on/utils/types';

import { AgentRepository } from '../agent/repository/agent.repository';
import { Role } from '../role/model/role.model';
import { PermissionRepository } from '../role/repository/permission.repository';
import { RolePermissionRepository } from '../role/repository/role-permission.repository';
import { RoleRepository } from '../role/repository/role.repository';
import { User } from '../user/model/user.model';
import { UserRepository } from '../user/repository/user.repository';

import { AdminCreateUserDto, AdminUpdateUserDto } from './dto/create-user.dto';
import { RolePermissionsDto } from './dto/permission.dto';
import { QueryUserDto } from './dto/query.dto';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { UpdateUserRoleDto } from './dto/user-role.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly user: UserRepository,
    private readonly role: RoleRepository,
    private readonly agent: AgentRepository,
    private readonly permission: PermissionRepository,
    private readonly rolePermission: RolePermissionRepository,
  ) {}

  /**
   * USER SECTION
   */

  async findUser(query: QueryUserDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const data = await this.user.findAndCount(query, {
      aggregate: { skip, limit },
      populate: [{ path: 'role' }],
      sort: { created_at: -1 },
    });

    return { data, message: `User successfully fetched` };
  }

  async createUser(payload: AdminCreateUserDto): Promise<ServiceResponse<User | any>> {
    const { role_id, phone, country_code, email } = payload;

    const role = await this.role.findById(role_id);
    if (!role) throw new NotFoundException('Role not found');

    const query = buildUserLookupQueryFromPayload({ phone, country_code, email });

    const userExists = await this.user.findOne(query);
    if (userExists) throw new ConflictException('User with this phone or email already exists');

    const [password, hashedPassword] = await generatePassword();

    const user = await this.user.create({
      ...payload,
      password: hashedPassword,
      password_changed: false,
      phone_verified: true,
      email_verified: true,
    });

    if (role.name === 'field-agent') {
      await this.agent.create({
        ...payload,
        user_id: user._id,
      });
    }

    const data = { ...user.toObject(), password };

    return { data, message: `User successfully created` };
  }

  async updateUser(id: string, payload: AdminUpdateUserDto): Promise<ServiceResponse<User>> {
    const { role_id } = payload;

    if (role_id) {
      const role = await this.role.findById(role_id);
      if (!role) throw new NotFoundException('Role not found');
    }

    const user = await this.user.updateById(id, payload, { new: true });
    if (!user) throw new NotFoundException('User not found');

    return { data: user, message: `User successfully updated` };
  }

  async deleteUser(id: string): Promise<ServiceResponse<null>> {
    const user = await this.user.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.user.deleteById(id);

    return { data: null, message: `User successfully deleted` };
  }

  /**
   * USER ROLE SECTION
   */
  async updateUserRole(user_id: string, payload: UpdateUserRoleDto): Promise<ServiceResponse<User>> {
    const { role_id, remove } = payload;

    const user = await this.user.findById(user_id);
    if (!user) throw new NotFoundException('User not found');

    let role: Role;

    if (remove) {
      role = await this.role.findOne({ name: 'customer' });
      if (!role) throw new NotFoundException('Default role not found');
    } else {
      if (!role_id) throw new BadRequestException('role_id is required when assigning a role');

      role = await this.role.findById(role_id);
      if (!role) throw new NotFoundException('Role not found');
    }

    await this.user.updateOne({ _id: user._id }, { role_id: role._id });

    const updatedUser = await this.user.findById(user._id);

    return {
      data: updatedUser,
      message: remove ? 'User role removed successfully' : 'User role assigned successfully',
    };
  }

  /**
   * ROLE SECTION
   */

  async createRole(payload: CreateRoleDto): Promise<ServiceResponse<Role>> {
    const { name, description } = payload;

    const existing = await this.role.findOne({ name: name.trim() });
    if (existing) throw new ConflictException('Role already exists');

    const role = await this.role.create({
      name: name.trim(),
      description: description?.trim(),
    });

    return { data: role, message: 'Role created successfully' };
  }

  async updateRole(role_id: string, payload: UpdateRoleDto): Promise<ServiceResponse<Role>> {
    const role = await this.role.findById(role_id);
    if (!role) throw new NotFoundException('Role not found');

    const { name, description } = payload;

    if (name !== undefined) {
      const existingRole = await this.role.findOne({ name: name.trim(), _id: { $ne: role._id } });
      if (existingRole) throw new ConflictException('Role already exists');
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();

    await role.updateOne(updateData);

    return { data: role, message: 'Role updated successfully' };
  }

  async deleteRole(role_id: string): Promise<ServiceResponse<null>> {
    const role = await this.role.findById(role_id);
    if (!role) throw new NotFoundException('Role not found');

    const assignedUser = await this.user.findOne({ role_id: role._id });
    if (assignedUser)
      throw new BadRequestException('Role cannot be deleted because it is assigned to one or more users');

    await this.rolePermission.deleteMany({ role_id: role_id });
    await this.role.deleteOne({ _id: role._id });

    return { data: null, message: 'Role deleted successfully' };
  }

  /**
   * PERMISSION SECTION
   */

  async assignRolePermissions(role_id: string, payload: RolePermissionsDto): Promise<ServiceResponse<null>> {
    const role = await this.role.findById(role_id);
    if (!role) throw new NotFoundException('Role not found');

    const permissionIds = [...new Set(payload.permission_ids)];

    const permissions = await this.permission.find({ _id: { $in: permissionIds } });
    if (permissions.length !== permissionIds.length) throw new NotFoundException('One or more permissions not found');

    const existing = await this.rolePermission.find({ role_id, permission_id: { $in: permissionIds } });

    const existingPermissionIds = new Set(existing.map((item) => item.permission_id.toString()));

    const newPermissions = permissionIds
      .filter((permissionId) => !existingPermissionIds.has(permissionId))
      .map((permissionId) => ({ role_id, permission_id: permissionId }));

    if (newPermissions.length) await this.rolePermission.createMany(newPermissions);

    return { data: null, message: 'Permissions assigned successfully' };
  }

  async removeRolePermissions(role_id: string, payload: RolePermissionsDto): Promise<ServiceResponse<null>> {
    const role = await this.role.findById(role_id);
    if (!role) throw new NotFoundException('Role not found');

    const permissionIds = [...new Set(payload.permission_ids)];

    const permissions = await this.permission.find({ _id: { $in: permissionIds } });
    if (permissions.length !== permissionIds.length) throw new NotFoundException('One or more permissions not found');

    await this.rolePermission.deleteMany({ role_id, permission_id: { $in: permissionIds } });

    return { data: null, message: 'Permissions removed successfully' };
  }
}
