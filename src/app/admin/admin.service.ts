import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { generatePassword } from '@on/helpers/password';
import { formatPhoneWithCode, parsePhone } from '@on/helpers/phone';
import { QueryDto } from '@on/utils/dto/query.dto';
import { ServiceResponse } from '@on/utils/types';

import { RoleRepository } from '../role/repository/role.repository';
import { User } from '../user/model/user.model';
import { UserRepository } from '../user/repository/user.repository';

import { AdminCreateUserDto, AdminUpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly user: UserRepository,
    private readonly role: RoleRepository,
  ) {}

  /**
   * USER SECTION
   */

  async findUser(query: QueryDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const data = await this.user.findAndCount(query, {
      aggregate: { skip, limit },
      populate: [{ path: 'roles' }],
      sort: { createdAt: -1 },
    });

    return { data, message: `User successfully fetched` };
  }

  async createUser(payload: AdminCreateUserDto): Promise<ServiceResponse<User | any>> {
    const { role_id, phone, country_code, email } = payload;

    const role = await this.role.findById(role_id);
    if (!role) throw new NotFoundException('Role not found');

    const normalizedPhone = formatPhoneWithCode(phone, country_code);
    const { code, phone: number } = parsePhone(normalizedPhone);

    const userExists = await this.user.findOne({ $or: [{ country_code: code, phone: number }, { email }] });
    if (userExists) throw new ConflictException('User with this phone or email already exists');

    const [hashedPassword, password] = await generatePassword();

    const user = await this.user.create({
      ...payload,
      password: hashedPassword,
      password_changed: false,
      phone_verified: true,
      email_verified: true,
    });

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
}
