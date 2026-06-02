import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { RoleRepository } from '@on/app/role/repository/role.repository';

import { UserRepository } from '../repository/user.repository';

import { users } from './data';

@Injectable()
export class UserSeeder implements OnModuleInit {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    private readonly user: UserRepository,
    private readonly role: RoleRepository,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    this.logger.log('Seeding users for roles...');

    for (const userSeed of users) {
      const role = await this.role.findOne({ name: userSeed.role });
      if (!role) {
        this.logger.warn(`Role not found: ${userSeed.role}`);
        continue;
      }

      const existingUser = await this.user.findOne({ phone: userSeed.phone });
      if (existingUser) {
        this.logger.log(`User already exists: ${userSeed.phone}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userSeed.password, 10);

      await this.user.create({
        country_code: userSeed.country_code,
        phone: userSeed.phone,
        email: userSeed.email,
        password: hashedPassword,
        role_id: role._id,
        phone_verified: true,
        email_verified: true,
        password_changed: true,
        status: 'active',
        last_login: null,
      });

      this.logger.log(`Created user for role: ${role.name}`);
    }

    this.logger.log('User seeding completed');
  }
}
